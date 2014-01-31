from ivapp.models import Dataset, Visualization
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class DatasetSerializer_List(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('id', 'name', 'description', 'schema', 'created_at', 'group')

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('id', 'name', 'description', 'schema', 'created_at', 'data', 'group')

class VisualizationSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source = 'user', read_only = True)
    dataset_info = DatasetSerializer(source = 'dataset', read_only = True)
    class Meta:
        model = Visualization
        fields = ('id', 'user', 'description', 'created_at', 'dataset',
                  'user_info', 'dataset_info',
                  'content')

class VisualizationSerializer_List(serializers.ModelSerializer):
    user_info = UserSerializer(source = 'user', read_only = True)
    dataset_info = DatasetSerializer_List(source = 'dataset', read_only = True)
    class Meta:
        model = Visualization
        fields = ('id', 'user', 'description', 'created_at', 'dataset',
                  'user_info', 'dataset_info')
