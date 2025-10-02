import graphene
from graphene_django import DjangoObjectType
from .models import Grade, ClassRoom

class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        fields = "__all__"

class ClassRoomType(DjangoObjectType):
    class Meta:
        model = ClassRoom
        fields = "__all__"

class Query(graphene.ObjectType):
    all_grades = graphene.List(GradeType)
    all_classes = graphene.List(ClassRoomType)

    def resolve_all_grades(root, info):
        return Grade.objects.all()

    def resolve_all_classes(root, info):
        return ClassRoom.objects.all()

class Mutation(graphene.ObjectType):
    pass
