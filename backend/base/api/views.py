from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect
from django.db.models.functions import TruncMonth
from django.db.models import Sum, Count
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from base.models import *
from rest_framework.generics import *
import json
from datetime import datetime
from rest_framework import generics, status
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import CreateModelMixin
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from collections import defaultdict
from rest_framework.permissions import IsAuthenticated
from django.db.models import Max, Min
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.utils import timezone
from decouple import config
import plaid
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.transactions_get_request import TransactionsGetRequest
from datetime import date

from django.core.serializers.json import DjangoJSONEncoder
from plaid.model.transactions_sync_request import TransactionsSyncRequest

from plaid.api import plaid_api
from plaid import ApiClient
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        'clientId': config('CLIENT_ID'),
        'secret': config('SANDBOX_KEY'),
    }
)

api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)





from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['firstname'] = user.first_name
        # ...

        return token
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh'
    ]
    return Response(routes)

@api_view(['POST'])
def user_registration(request):
    if request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errors during serialization:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






class GetAccessToken(APIView):
    def get(self, request, format=None):
            user = request.user
            if user.is_authenticated:
                data = {
                    'user': {
                        'client_user_id': str(user.id)
                    },
                    'products': ["transactions"],
                    'client_name': "FinTracker",
                    'country_codes': ['US'],
                    'language': 'en'
                }

                # Assuming client.link_token_create(data) returns a LinkTokenCreateResponse object
                link_token_response = client.link_token_create(data)
                
                # Extract the relevant data from the LinkTokenCreateResponse object
                link_token_value = link_token_response.to_dict()  # Adjust based on your actual method or attributes
                
                # Save the link_token_value to the .env file using python-decouple
                
                return Response(link_token_value)
            else:
                return Http404
            



class ReceiveAccessToken(APIView):
    serializer_class = AccessTokenSerializer  # Corrected the typo in 'serializer_class'
    
    def post(self, request, *args, **kwargs):
        try:
            public_token = request.data.get('public_token')
            
            if not public_token:
                return Response({"error": "public_token is missing"}, status=400)
            
            exchange_request = ItemPublicTokenExchangeRequest(
                public_token=public_token
            )
            
            exchange_response = client.item_public_token_exchange(exchange_request)
            access_token_value = exchange_response.get('access_token')
            
            if not access_token_value:
                return Response({"error": "Failed to obtain access token"}, status=400)
            
            # Assuming you have the user associated with the access token. Modify this as per your requirement.
            user = request.user
            
            # Save the data using the serializer
            serializer = self.serializer_class(data={
                'accesstoken': access_token_value,
                'user': user.id  # Assuming user is associated with the AccessToken model
            })
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            else:
                print(serializer.errors)
                return Response(serializer.errors, status=400) # 201 Created
                
        
        except Exception as e:
            # Log the exception for debugging purposes
            print(f"An error occurred: {e}")
            return Response({"error": "An error occurred while processing the request"}, status=500)


  # Adjust the import path accordingly

  # Adjust the import path accordingly

import random

class FetchTransactions(APIView):

    def get(self, request, format=None):
        user = request.user
        access_tokens = AccessToken.objects.filter(user=user)
        serializer = AccessTokenSerializer(access_tokens, many=True)
        try:
            cursor_obj = access_tokens.first()
            latest_cursor = cursor_obj.cursor
        except AccessToken.DoesNotExist:
            latest_cursor = None

        latest_cursor = str(latest_cursor) if latest_cursor else ""

        transactions = []
        removed = []
        modified = []
        balance = []

        # Loop through each serialized token data to create and process the TransactionsSyncRequest
        for token_data in serializer.data:
            request_data = {
                'access_token': token_data['accesstoken'],  # corrected typo
                'options': {
                    'include_original_description': True
                },
                'cursor': latest_cursor
                
            }
            requests = TransactionsSyncRequest(**request_data)
            response = client.transactions_sync(requests)
            transactions += response['added']
            modified += response['modified']
            removed += response['removed']

            # If there are more transactions to fetch, update the cursor
            while response['has_more']:
                latest_cursor = response['next_cursor']
                response = client.transactions_sync(requests)
                balance = response['accounts']
        cursor_obj = access_tokens.first()
        if cursor_obj:
            cursor_obj.cursor = latest_cursor
            cursor_obj.save()

        # Process transactions
        for transaction in transactions:
            
            try:
                existing_expense = Expenses.objects.get(transaction_id=transaction['transaction_id'], user=user)
                
                existing_expense.save()
                continue
            except Expenses.DoesNotExist:
                expense = Expenses()
                expense.id = random.randint(1, 99999)
                expense.transaction_id = transaction['transaction_id']
                
                if transaction['amount'] >= 0:
                    expense.amount = transaction['amount']
                    
                    
                    
                else:
                    expense.amount = abs(transaction['amount'])
                expense.date = transaction['authorized_date']
                expense.user = user
                try:
                    expense_category = Category.objects.get(name=transaction['category'][0])
                except Category.DoesNotExist:
                    expense_category = Category.objects.create(id=random.randint(1, 99999), 
                                                                name=transaction['category'][0], 
                                                                slug=transaction['category'][1], 
                                                                user=user)
                expense.category = expense_category
                expense.description = transaction['counterparties'][0]['name']
                expense.save()

        # Serialize the list of Transaction objects to JSON
        final = json.dumps(transactions, default=str)  # Using default=str to serialize datetime objects
 
        # Return a response with the serialized transactions
        return Response({"transactions": 'json.loads(final)'})

class CreateExpenseAPIView(generics.CreateAPIView):
    queryset = Expenses.objects.all()
    serializer_class = BasicExpenseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)
    
class CreateCategoryAPIView(CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)

class FetchCategory(APIView):
    def get(self, request, format=None):
        user = request.user.id
        categories = Category.objects.filter(user=user)
        serializer = CategorySerializer(categories, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CreateIncomeCategoryAPIView(CreateAPIView):
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)

class FetchIncomeCategory(APIView):
    def get(self, request, format=None):
        user = request.user
        categories = user.incomecategory_set.all()
        serializer = IncomeCategorySerializer(categories, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CreateIncomeAPIView(generics.CreateAPIView):
    queryset = Income.objects.all()
    serializer_class = BasicIncomeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)


class FetchRecentActivity(APIView):
    def get(self, request, format=None):
        user = request.user

        # Determine the date range for the seven-day interval
        end_date = timezone.now()
        start_date = end_date - timedelta(days=100)

        # Fetch most recent activity for each model
        recent_expenses = Expenses.objects.filter(user=user, date__range=(start_date, end_date)).order_by('-date').first()
        recent_incomes = Income.objects.filter(user=user, date__range=(start_date, end_date)).order_by('-date').first()
        recent_goals = Goal.objects.filter(user=user, date__range=(start_date, end_date)).order_by('-date').first()
        recent_budget = Budget.objects.filter(user=user, start_date__range=(start_date, end_date)).order_by('-start_date').first()
        serializer_1 = ExpenseSerializer(recent_expenses, many=False)
        serializer_2 = IncomeSerializer(recent_incomes, many=False)
        serializer_3 = GoalSerializer(recent_goals, many=False)
        serializer_4 = BudgetSerializer(recent_budget, many=False)



        # Save the fetched information or process as needed
        # For example, you can save it to another model or perform other operations.
        # ...

        return Response({
            'recent_expenses': serializer_1.data if recent_expenses else None,  # Assuming you have a serialize method or similar
            'recent_incomes': serializer_2.data if recent_incomes else None,
            'recent_goals': serializer_3.data if recent_goals else None,
            'recent_budget': serializer_4.data if recent_budget else None,
        })
    
class MasterCardInfo(APIView):
    def get(self, request, format=None):
        user =  request.user

        return Response({
            'partner_id': config('PARTNER_ID'),
            'secret_key': config('SECRET_MASTER'),
            'app_key': config('APP_KEY_MASTER')

        })
    





class FetchExpenses(APIView):
    def get(self, request, format=None):
        user = request.user
        expenses = user.expenses_set.all()
        serializer = ExpenseSerializer(expenses, many=True)
 
        total_expenses = expenses.aggregate(Sum('amount')).get('amount__sum', 0)

        highest_expense = expenses.aggregate(Max('amount')).get('amount__max', None)
        lowest_expense = expenses.aggregate(Min('amount')).get('amount__min', None)

        days_expenses = expenses.values('date', 'category').annotate(total_expenses=Sum('amount'))


        # Prepare a dictionary to store total expenses for each day
        daily_total_expenses = {}
        for day_expense in days_expenses:
            formatted_date = day_expense['date'].strftime('%Y-%m-%d')
            daily_total_expenses[formatted_date] = day_expense['total_expenses']

        final = []
        category_names_added = set()

        for i in serializer.data:
            category_id = i['category']['id']
            category = get_object_or_404(Category, id=category_id)
            budget = Budget.objects.filter(category=category).first()

            if budget and budget.category.name not in category_names_added:
                final.append([budget.amount, budget.category.name])
                category_names_added.add(budget.category.name)
            elif not budget:
                final.append(None)

        # Calculate total percentage for each category based on total expenses
        category_percentages = []
        for item in final:
            if item:
                budget_amount, category_name = item
                category_expenses = expenses.filter(category__name=category_name).aggregate(Sum('amount')).get('amount__sum', 0)
                percentage = (category_expenses / total_expenses) * 100
                category_percentages.append({'category': category_name, 'percentage': percentage})

        months_expenses = expenses.annotate(month=TruncMonth('date')).values('month').annotate(total_expenses=Sum('amount'), expense_count=Count('id'))

        # Prepare a dictionary to store total expenses and count for each month
        monthly_expense_data = {}
        for month_expense in months_expenses:
            formatted_month = month_expense['month'].strftime('%Y-%m')
            monthly_expense_data[formatted_month] = {
                'total_expenses': month_expense['total_expenses'],
                'expense_count': month_expense['expense_count']
            }
        

        daily_category_expenses = defaultdict(dict)
        for day_expense in days_expenses:
            category_id = day_expense['category']
            category = Category.objects.get(id=category_id)
            
            formatted_date = day_expense['date'].strftime('%Y-%m-%d')
            daily_category_expenses[formatted_date][category.name] = day_expense['total_expenses']
            

        # Collect highest two category expenses for every 7 days
        weekly_top_two_expenses = {}
        current_week_expenses = defaultdict(float)
        for date, categories in daily_category_expenses.items():
            for category, expense in categories.items():
                current_week_expenses[category] += float(expense)

            if len(current_week_expenses) <= 7:
                top_two = sorted(current_week_expenses.items(), key=lambda x: x[1], reverse=True)[:2]
                weekly_top_two_expenses[date] = top_two
                # Reset for next 7 days
                current_week_expenses = defaultdict(float)

        # Handle the remaining days if they are less than 7
        if current_week_expenses:
            top_two = sorted(current_week_expenses.items(), key=lambda x: x[1], reverse=True)[:2]
            weekly_top_two_expenses[date] = top_two
                




        return Response({
            'expenses': serializer.data,
            'daily_total_expenses': daily_total_expenses, 
            'highest_expense': highest_expense,
            'lowest_expense': lowest_expense,
            'final': final,
            'category_percentages': category_percentages,
            'total_expenses': total_expenses,
            'monthly_total_expenses': monthly_expense_data,
            'weekly_top_two_expenses': weekly_top_two_expenses,
        }, status=status.HTTP_200_OK)
    
class FetchIncome(APIView):
    def get(self, request, format=None):
        user = request.user

        # Get all income objects for the user
        income = Income.objects.filter(user=user)
        serializer = IncomeSerializer(income, many=True)
        total_income = Income.get_total_income(user)

        # Calculate the highest and lowest income amounts using the serializer data
        highest_income = max(serializer.data, key=lambda item: item['amount'])['amount']
        lowest_income = min(serializer.data, key=lambda item: item['amount'])['amount']

        return Response({
            'income': serializer.data,
            'highest_income': highest_income,
            'lowest_income': lowest_income,
            'total_income': total_income
        }, status=status.HTTP_200_OK)
    
class CreateBudget(CreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BasicBudgetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)

class FetchBudget(APIView):
    def get(self, request, format=None):
        user = request.user
        budget = user.budget_set.all()
        serializer = BudgetSerializer(budget, many=True)

        # Calculate the highest expense amount using Django's aggregation function
       

        
        return Response({
            'budget': serializer.data,
            
        }, status=status.HTTP_200_OK)
    
class EditBudget(generics.RetrieveUpdateDestroyAPIView):
    queryset = Budget.objects.all()
    serializer_class = UpdateBudgetSerializer
    lookup_url_kwarg = 'id'
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        print("Received PUT request for budget ID:", instance.id)
        print("Request data:", request.data)

        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Errors during serialization:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateGoal(CreateAPIView):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically fill the 'user' field with the current user
        serializer.save(user=self.request.user)
        

class EditIncome(generics.RetrieveUpdateDestroyAPIView):
    queryset = Income.objects.all()
    serializer_class = UpdateIncomeSerializer
    lookup_url_kwarg = 'id'
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        print("Received PUT request for income ID:", instance.id)
        print("Request data:", request.data)

        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Errors during serialization:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class EditExpenses(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expenses.objects.all()
    serializer_class = UpdateExpenseSerializer
    lookup_url_kwarg = 'id'
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        print("Received PUT request for expense ID:", instance.id)
        print("Request data:", request.data)

        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Errors during serialization:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class EditGoal(generics.RetrieveUpdateDestroyAPIView):
    queryset = Goal.objects.all()
    serializer_class = UpdateGoalSerializer
    lookup_url_kwarg = 'id'
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        print("Received PUT request for Goal ID:", instance.id)
        print("Request data:", request.data)

        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Errors during serialization:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FetchGoal(APIView):
    def get(self, request, format=None):
        user = request.user
        goals = user.goal_set.all()
        serializer = GoalSerializer(goals, many=True)

        # Deserialize the data to create instances of the Goal model
        #goal_instances = [Goal(**item) for item in serializer.data]

        #expired_goals = [goal for goal in goal_instances if goal.is_expired()]
        #for goal in expired_goals:
            #send_goal_email(goal)

   

        # Calculate the highest expense amount using Django's aggregation function
       

        
        return Response({
            'goal': serializer.data,
            
        }, status=status.HTTP_200_OK)
    

def send_goal_email(goal, self, request, format=None):
    firstname = self.request.user.first_name
    lastname = self.request.user.last_name
    email = self.request.user.email
    title = goal.title
    subject = "Goal End"
    message = f'Hello {firstname} {lastname}, This is just a reminder that your goal {title} time period has ended'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list,fail_silently=False)