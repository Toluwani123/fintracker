from base.models import *
from rest_framework import serializers
from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password')

    

    def validate(self, data):
        password = data.get('password')
        


        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'user')

class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = ('id', 'name', 'slug', 'user')


class ExpenseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=False)
    class Meta:
        model = Expenses
        fields = (
            'id',
            'amount',
            'description',
            'date',
            'category',
            'user', 
           
        )

class BasicExpenseSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = Expenses
        fields = (
            'amount',
            'description',
            'date',
            'category',
            'user', 
           
        )

class UpdateExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenses
        fields = (
            
            'amount',
            'id',
            
            'date',
            'category',
             
        )
        def validate(self, data):
            print("Validating serializer data:", data)
            # Add your validation logic here if needed
            return data
        
class UpdateIncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = (
            
            'amount',
            'id',
            
            'date',
            'category',
             
        )
        def validate(self, data):
            print("Validating serializer data:", data)
            # Add your validation logic here if needed
            return data

class IncomeSerializer(serializers.ModelSerializer):
    category = IncomeCategorySerializer(many=False)
    class Meta:
        model = Income
        fields = (
            'id',
            'amount',
            'description',
            'date',
            'category',
            'user',  
            
        )

class AccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessToken
        fields = (
            'accesstoken',
            'user'
        )

class BasicIncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = (
            'amount',
            'description',
            'date',
            'category',
            'user',  
            
        )






class BudgetSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=False)

    class Meta:
        model = Budget
        fields = ('id','amount', 'start_date', 'end_date', 'category', 'user')

class BasicBudgetSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Budget
        fields = ('amount', 'start_date', 'end_date', 'category', 'user')


class UpdateBudgetSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Budget
        fields = ('id', 'amount', 'category')

        def validate(self, data):
            print("Validating serializer data:", data)
            # Add your validation logic here if needed
            return data

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ('id','amount', 'description','date', 'end_date', 'title', 'user')

class UpdateGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ('id', 'amount')