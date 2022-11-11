from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import render, redirect

from main.forms import NewUser
from main.models import UserProfile


def register_request(request):
	if request.method == "POST":
		form = NewUser(request.POST)
		if form.is_valid():
			user = form.save()
			username = request.POST.get('username')
			email = request.POST.get('email')
			user_profile = UserProfile(user=user, username=username, email=email)
			user_profile.save()
			login(request, user)
			messages.success(request, "Registration successful." )
			return redirect("login")
		messages.error(request, "Unsuccessful registration. Invalid information.")
	form = NewUser()
	return render(request=request, template_name="registration/register.html", context={"register_form":form})


