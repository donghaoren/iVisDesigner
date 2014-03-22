from django.db import models
from django.contrib.auth.models import User, Group

class Dataset(models.Model):
    created_at = models.DateTimeField()          # Time created.
    name = models.CharField(max_length = 255)    # Name.
    description = models.TextField()             # Description text.
    schema = models.TextField()                  # JSON schema.
    data = models.TextField()                    # JSON data content.
    group = models.ForeignKey(Group, blank = True, null = True)             # Which group can access it.

    def __unicode__(self):
        return self.name

class Visualization(models.Model):
    created_at = models.DateTimeField(auto_now = True)          # Time created.
    content = models.TextField()                 # JSON string for this visualization.
    description = models.TextField()             # Description text.
    user = models.ForeignKey(User)               # Author.
    dataset = models.ForeignKey(Dataset)         # Dataset.
    uuid = models.CharField(max_length = 64)     # UUID of the visualization.
    is_autosave = models.BooleanField(default = False)          # Is this visualization an autosave?
    is_private = models.BooleanField(default = True)            # Is this visualization private?
    def __unicode__(self):
        return "%s (%s)" % (self.description, self.user.username)
