from django.urls import path
from . import views

from .views import *


from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('', getRoutes),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-expense/', CreateExpenseAPIView.as_view(), name='create_expense'),
    path('create-income/', CreateIncomeAPIView.as_view(), name='create_income'),
    path('create-category/', CreateCategoryAPIView.as_view(), name='create_category'),
    path('categories/', FetchCategory.as_view(), name='category'),
    path('create-incomecategory/', CreateIncomeCategoryAPIView.as_view(), name='create_incomecategory'),
    path('incomecategories/', FetchIncomeCategory.as_view(), name='incomecategory'),
    path('expenses/', FetchExpenses.as_view(), name='expenses'),
    path('income/', FetchIncome.as_view(), name='income'),
    path('create-budget/', CreateBudget.as_view(), name='create_budget'),
    path('create-goal/', CreateGoal.as_view(), name='create_goal'),
    path('edit-expenses/<int:id>/', EditExpenses.as_view(), name='edit-expense'),
    path('edit-income/<int:id>/', EditIncome.as_view(), name='edit-income'),
    path('budgets/', FetchBudget.as_view(), name='budgets'),
    path('edit-budget/<int:id>/', EditBudget.as_view(), name='edit-budget'),
    path('goals/', FetchGoal.as_view(), name='goals'),
    path('edit-goal/<int:id>/', EditGoal.as_view(), name='edit-goal'),
    path('recent-activity/', FetchRecentActivity.as_view(), name='recent-activity'),
    path('register/', user_registration, name='user_registration'),
    path('mastercard/', MasterCardInfo.as_view(), name='master_card'),
    path('create_link_token/', GetAccessToken.as_view(), name='create-link-token'),
    path('receive_access_token/', ReceiveAccessToken.as_view(), name='receive-access-token'),
    path('fetch_transactions/', FetchTransactions.as_view(), name='fetch-transactions'),



   

]

