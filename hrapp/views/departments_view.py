
from ajax_datatable.views import AjaxDatatableView
from django.db.models.deletion import ProtectedError
from django.forms import model_to_dict
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from hrapp.forms.department_form import DepartmentForm
from hrapp.repositories.department_repository import DepartmentRepository
from hrapp.utils import _json_response, ajax_request

from .base_view import BaseView


class DepartmentsView(BaseView):
    
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self.data = super().data
    
    def get(self, request):
        try:
            if ajax_request(request):
                department = DepartmentRepository.get(pk = request.GET.get('id'))
                if not department:
                     return _json_response('Not Found', status=404)
                return _json_response(model_to_dict(department))
            return render(request, 'departments/index.html', self.data)
        except Exception as e:
            if ajax_request(request):
                return _json_response('Something went wrong!', status=400)
            return HttpResponseRedirect(redirect_to=reverse('home'))
    
    def post(self, request):
        if request.POST.get('_method') == 'PATCH':
            return self.patch(request, request.POST.get('id'))
        elif request.POST.get('_method') == 'DELETE':
             return self.delete(request, request.POST.get('id'))
         
        try:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                DepartmentRepository.create(**form.cleaned_data)
                return _json_response('Added Successfully')
            else:
                return _json_response(form.errors, type = 'error')
        except Exception as e:
            return _json_response('Something went wrong!', status=400)
        
    def patch(self, request, id):
        try:
            department = DepartmentRepository.get(pk = id)
            if not department:
                return _json_response('Not Found', status=404)
            form = DepartmentForm(request.POST, instance=department)
            if form.is_valid():
                DepartmentRepository.update(department, **form.cleaned_data)
                return _json_response('Updated Successfully')
            else:
                return _json_response(form.errors, type = 'error')
        except Exception as e:
            return _json_response('Something went wrong!', status=400)
        
    def delete(self, request, id):
        try:
            department = DepartmentRepository.get(pk = id)
            if not department:
                return _json_response('Not Found', status=404)
            DepartmentRepository.delete(department)
            return _json_response('Deleted Successfully')
        except Exception as e:
            if isinstance(e, ProtectedError):
                return _json_response('This Department cannot be removed because it has users', status=400)
            return _json_response('Something went wrong!', status=400)
        


class DepartmentsDatatableView(AjaxDatatableView):
    model = DepartmentRepository.model
    title = 'Departments'
    initial_order = [["name", "asc"], ]
    length_menu = [[10, 20, 50, 100, -1], [10, 20, 50, 100, 'all']]
    search_values_separator = '+'
    
    column_defs = [
        {'name': 'id', 'visible': False, },
        {'name': 'code', 'visible': True, 'title': 'Department Code',},
        {'name': 'name', 'visible': True,'title': 'Department Name' },
        {'name': 'options', 'visible': True, 'title': 'Options','searchable': False, 'orderable': False },
    ]
    
    def customize_row(self, row, obj):
        row['options'] = '''
        <a href="#" onclick="Departments.edit(this);return false;" data-id="{id}" class="btn btn-sm btn-primary" title="edit"><i class="fa-solid fa-pencil"></i></a>
        <a href="#" onclick="Departments.delete(this);return false;" data-id="{id}" class="btn btn-sm btn-danger" title="delete"><i class="fa-solid fa-trash"></i></a>
        '''.format(id=obj.id)
        return
