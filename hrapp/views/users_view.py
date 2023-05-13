
import copy

from django.forms import model_to_dict
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from hrapp.forms.user_form import UserForm
from hrapp.repositories.department_repository import DepartmentRepository
from hrapp.repositories.user_repository import UserRepository
from hrapp.utils import _json_response, ajax_request

from .base_view import BaseView


class UsersView(BaseView):
    
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self.data = super().data
        
    def _get_users_search_tree_nodes(self, users):
        tree_nodes = {}
        department_tree_node = {
                'id': "", 
                'text': "", 
                'icon': "fa-solid fa-folder",
                'children': []
        }
        user_tree_node = {
                'id': "", 
                'text': "", 
                'icon': "fas fa-user fa-sm",
                'children': False
        }
        for user in users:
            if user.department.name not in tree_nodes:
                department_node = copy.deepcopy(department_tree_node)
                department_node.update({'id': user.department.id, 'text': user.department.name})
                tree_nodes[user.department.name] = department_node
            user_node = dict(user_tree_node)
            user_node.update({'id': f'user-{user.id}', 'text': user.username})
            tree_nodes[user.department.name]['children'].append(user_node)
        return list(tree_nodes.values())
    
    def _get_departments_tree_nodes(self):
        departments_nodes = []
        tree_node = {
                'id': "", 
                'text': "", 
                'icon': "fa-solid fa-folder",
                'children': True
        }
        departments = DepartmentRepository.all()
        for department in departments:
            department_node = dict(tree_node)
            department_node.update({'id': department.id, 'text': department.name})
            departments_nodes.append(department_node)
        return departments_nodes
    
    
    def _get_users_tree_nodes(self, users):
        users_nodes = []
        tree_node = {
                'id': "", 
                'text': "", 
                'icon': "fas fa-user fa-sm",
                'children': False
        }
        for user in users:
            user_node = dict(tree_node)
            user_node.update({'id': f'user-{user.id}', 'text': user.username})
            users_nodes.append(user_node)
        return users_nodes
    
    
    def get(self, request):
        try:    
            if ajax_request(request):
                if request.GET.get('id'):
                    user = UserRepository.get(pk = request.GET.get('id'))
                    if not user:
                        return _json_response('Not Found', status=404)
                    return _json_response(model_to_dict(user))
                else:
                    data = []
                    if request.GET.get('parent') != '#':
                        data = self._get_users_tree_nodes(UserRepository.get_department_users(request.GET.get('parent')))
                    else:
                        if request.GET.get('code') or request.GET.get('username'):
                            data = self._get_users_search_tree_nodes(UserRepository.get_department_users(code = request.GET.get('code'), username = request.GET.get('username')))
                        else:
                            data = self._get_departments_tree_nodes()
                    return JsonResponse(data, safe=False)
            self.data['departments'] = DepartmentRepository.all()
            return render(request, 'users/index.html', self.data)
        except Exception as e:
            if ajax_request(request):
                return _json_response(model_to_dict(e), status=400)
            return HttpResponseRedirect(redirect_to=reverse('home'))
    
    
    def post(self, request):
        if request.POST.get('_method') == 'PATCH':
            return self.patch(request, request.POST.get('id'))
        elif request.POST.get('_method') == 'DELETE':
             return self.delete(request, request.POST.get('id'))
         
        try:
            form = UserForm(request.POST)
            if form.is_valid():
                UserRepository.create(**form.cleaned_data)
                return _json_response('Added Successfully')
            else:
                return _json_response(form.errors, type = 'error')
        except Exception as e:
            return _json_response('Something went wrong!', status=400)
        
        
    def patch(self, request, id):
        try:
            user = UserRepository.get(pk = id)
            if not user:
                return _json_response('Not Found', status=404)
            form = UserForm(request.POST, instance=user)
            if form.is_valid():
                UserRepository.update(user, **form.cleaned_data)
                return _json_response('Updated Successfully')
            else:
                return _json_response(form.errors, type = 'error')
        except Exception as e:
            return _json_response('Something went wrong!', status=400)
        
        
    def delete(self, request, id):
        try:
            user = UserRepository.get(pk = id)
            if not user:
                return _json_response('Not Found', status=404)
            UserRepository.delete(user)
            return _json_response('Deleted Successfully')
        except Exception as e:
            return _json_response('Something went wrong!', status=400)
