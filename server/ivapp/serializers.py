from ivapp.models import Dataset, Visualization
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class DatasetSerializer_List(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('id', 'name', 'description', 'schema', 'created_at')

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('id', 'name', 'description', 'schema', 'created_at', 'data')

class VisualizationSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source = 'user')
    dataset_info = DatasetSerializer(source = 'dataset')
    class Meta:
        model = Visualization
        fields = ('id', 'user', 'description', 'created_at', 'dataset',
                  'user_info', 'dataset_info',
                  'content')

class VisualizationSerializer_List(serializers.ModelSerializer):
    user_info = UserSerializer(source = 'user')
    dataset_info = DatasetSerializer_List(source = 'dataset')
    class Meta:
        model = Visualization
        fields = ('id', 'user', 'description', 'created_at', 'dataset',
                  'user_info', 'dataset_info')
