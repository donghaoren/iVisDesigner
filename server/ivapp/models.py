from django.db import models
from django.contrib.auth.models import User

class Dataset(models.Model):
    created_at = models.DateTimeField()          # Time created.
    name = models.CharField(max_length = 255)    # Name.
    description = models.TextField()             # Description text.
    schema = models.TextField()                  # JSON schema.
    data = models.TextField()                    # JSON data content.

    def __unicode__(self):
        return self.name

class Visualization(models.Model):
    created_at = models.DateTimeField()          # Time created.
    content = models.TextField()                 # JSON string for this visualization.
    description = models.TextField()             # Description text.
    user = models.ForeignKey(User)               # Author.
    dataset = models.ForeignKey('Dataset')       # Dataset.

    def __unicode__(self):
        return self.description
