from hrapp.models.user import User

from .base_repository import BaseRepository


class UserRepository(BaseRepository):
    model = User
    
    @classmethod
    def get_department_users(cls, department_id = None, **kwargs):
        users = cls.model.objects
        if department_id:
            users = users.filter(department_id = department_id)
        else:
           
            users = users.prefetch_related('department')
            for key, value in kwargs.items():
                if value:
                    users = users.filter(**{key+'__contains': value})
        return users
            
    
    