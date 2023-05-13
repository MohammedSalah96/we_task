from django.shortcuts import render

from .base_view import BaseView


class BasicView(BaseView):
    data = BaseView.data
    
    @classmethod
    def home(cls, request):
        return render(request, 'index.html', cls.data)