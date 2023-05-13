from django.urls import path

from .views.basic_view import BasicView
from .views.departments_view import DepartmentsDatatableView, DepartmentsView
from .views.users_view import UsersView

urlpatterns = [
    path('', BasicView.home, name='home'),
    path('departments_data/', DepartmentsDatatableView.as_view(), name='departments_data'),
    path('departments/', DepartmentsView.as_view(), name='departments'),
    path('users/', UsersView.as_view(), name='users')
]
