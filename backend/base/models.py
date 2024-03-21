from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from datetime import date
from django.db.models import Sum



class AccessToken(models.Model):
    accesstoken = models.CharField(max_length=200000, null=True, blank=True)
    cursor = models.CharField(null=True, blank=True, max_length=200000)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

class Category(models.Model):
    name = models.CharField(max_length=225)
    slug = models.SlugField()
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    
    class Meta:
        ordering = ('name',)
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return f'/{self.slug}/'
    
class IncomeCategory(models.Model):
    name = models.CharField(max_length=225)
    slug = models.SlugField()
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    
    class Meta:
        ordering = ('name',)
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return f'/{self.slug}/'
    


class Expenses(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(blank=True, null=True, max_length=100000000)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    description = description = models.CharField(max_length=10000)
    date = models.DateField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete = models.CASCADE, blank = True, null=True)
    
    @staticmethod
    def get_highest_expense(user):
        try:
            highest_expense = Expenses.objects.filter(user=user).order_by('-amount').first()
            return highest_expense
        except Expenses.DoesNotExist:
            return None

    @staticmethod
    def get_lowest_expense(user):
        try:
            lowest_expense = Expenses.objects.filter(user=user).order_by('amount').first()
            return lowest_expense
        except Expenses.DoesNotExist:
            return None


class Income(models.Model):
    amount = models.PositiveIntegerField(blank=False, null=False)
    description = description = models.CharField(max_length=10000)
    date = models.DateField(auto_now_add=True)
    category = models.ForeignKey(IncomeCategory, on_delete = models.CASCADE, blank = True, null=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    @staticmethod
    def get_highest_income(user):
        try:
            highest_expense = Income.objects.filter(user=user).order_by('-amount').first()
            return highest_expense
        except Income.DoesNotExist:
            return None

    @staticmethod
    def get_lowest_income(user):
        try:
            lowest_expense = Income.objects.filter(user=user).order_by('amount').first()
            return lowest_expense
        except Income.DoesNotExist:
            return None
        
    @staticmethod
    def get_total_income(user):
        try:
            total_income = Income.objects.filter(user=user).aggregate(Sum('amount'))
            return total_income['amount__sum'] or 0
        except Income.DoesNotExist:
            return 0

class Budget(models.Model):
    amount = models.PositiveIntegerField(blank=False, null=False)
    start_date = models.DateField()
    end_date = models.DateField()
    category = models.ForeignKey(Category, on_delete = models.CASCADE, blank = True, null=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

class Goal(models.Model):
    amount = models.PositiveIntegerField(blank=False, null=False)
    description = description = models.CharField(max_length=10000)
    date = models.DateField(auto_now_add=True)
    title = models.CharField(max_length=1000)
    end_date = models.DateField()
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    def is_expired(self):
        return self.end_date < date.today()

