from django.urls import path
from . import views
from django.views.generic.base import TemplateView

app_name = "main"

urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name="index"),
    path('registration', views.register_request, name="registration"),
    path('home', TemplateView.as_view(template_name="home.html"), name="home"),
    path('create', TemplateView.as_view(template_name="createTrip.html"), name="createTrip"),
    path('manage', TemplateView.as_view(template_name="manageTrip.html"), name="manageTrip"),
    path('edit', TemplateView.as_view(template_name="editProfile.html"), name="editProfile"),
]