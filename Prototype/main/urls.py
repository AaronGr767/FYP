from django.urls import path
from . import views
from django.views.generic.base import TemplateView

app_name = "main"

urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name="index"),
    path('registration', views.register_request, name="registration"),
    path('logout', views.logout_request, name="logout"),
    path('home', TemplateView.as_view(template_name="home.html"), name="home"),
    path('create', TemplateView.as_view(template_name="createTrip.html"), name="createTrip"),
    path('choose', TemplateView.as_view(template_name="chooseAttractions.html"), name="chooseAttractions"),
    path('routeMap', TemplateView.as_view(template_name="routeMap.html"), name="routeMap"),
    path('finishCreate', TemplateView.as_view(template_name="finishCreate.html"), name="finishCreate"),
    path('manage', TemplateView.as_view(template_name="manageTrip.html"), name="manageTrip"),
    path('edit', TemplateView.as_view(template_name="editProfile.html"), name="editProfile"),
    path('comparesimilarity', views.compareSimilarity, name="compareSimilarity"),
    path('filterAttractions/', views.filterAttractions, name="filterAttractions"),
    path('savetrip/', views.saveTrip, name="saveTrip"),
    path('retrievetrip/', views.retrieveTrip, name="retrieveTrip"),
    path('doingTrip/updaterating/', views.updateRating, name="updateRating"),
    path('doingTrip/updatetripstatus/', views.updateTripStatus, name="updatetripstatus"),
    path('startTrip/', TemplateView.as_view(template_name="startTrip.html"), name="startTrip"),
    path('doingTrip/', TemplateView.as_view(template_name="doingTrip.html"), name="doingTrip"),
    path('tripRoute', TemplateView.as_view(template_name="tripRoute.html"), name="tripRoute"),
    path('managetripretrieve/', views.manageTripRetrieve, name="manageTripRetrieve"),
    path('managetripdelete/', views.manageTripDelete, name="manageTripDelete"),
]