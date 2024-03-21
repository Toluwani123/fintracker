from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(Expenses)
admin.site.register(Income)
admin.site.register(Budget)
admin.site.register(Goal)
admin.site.register(Category)
admin.site.register(AccessToken)
