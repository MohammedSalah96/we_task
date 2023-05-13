from django import forms

from hrapp.models.user import User


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = "__all__"
