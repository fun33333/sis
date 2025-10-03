# import graphene
# from graphene_django import DjangoObjectType
# from .models import Coordinator
# from classes.models import ClassRoom, Grade
# from teachers.models import Teacher
# from students.models import Student


# # ============================
# # Types
# # ============================

# class CoordinatorType(DjangoObjectType):
#     class Meta:
#         model = Coordinator
#         fields = "__all__"


# class ClassRoomType(DjangoObjectType):
#     class Meta:
#         model = ClassRoom
#         fields = "__all__"


# class GradeType(DjangoObjectType):
#     class Meta:
#         model = Grade
#         fields = "__all__"


# class TeacherType(DjangoObjectType):
#     class Meta:
#         model = Teacher
#         fields = "__all__"


# class StudentType(DjangoObjectType):
#     class Meta:
#         model = Student
#         fields = "__all__"


# # ============================
# # Queries
# # ============================

# class Query(graphene.ObjectType):
#     all_coordinators = graphene.List(CoordinatorType)
#     coordinator = graphene.Field(CoordinatorType, id=graphene.Int(required=True))

#     all_classes = graphene.List(ClassRoomType)
#     all_teachers = graphene.List(TeacherType)
#     all_students = graphene.List(StudentType)
#     all_grades = graphene.List(GradeType)

#     def resolve_all_coordinators(root, info):
#         return Coordinator.objects.all()

#     def resolve_coordinator(root, info, id):
#         return Coordinator.objects.get(id=id)

#     def resolve_all_classes(root, info):
#         return ClassRoom.objects.all()

#     def resolve_all_teachers(root, info):
#         return Teacher.objects.all()

#     def resolve_all_students(root, info):
#         return Student.objects.all()

#     def resolve_all_grades(root, info):
#         return Grade.objects.all()


# # ============================
# # Mutations
# # ============================

# class CreateCoordinator(graphene.Mutation):
#     class Arguments:
#         full_name = graphene.String(required=True)
#         email = graphene.String()
#         phone = graphene.String()
#         gender = graphene.String()
#         cnic = graphene.String()
#         campus_id = graphene.Int(required=True)
#         section_id = graphene.Int(required=True)

#     coordinator = graphene.Field(CoordinatorType)

#     @classmethod
#     def mutate(cls, root, info, full_name, campus_id, section_id, **kwargs):
#         coordinator = Coordinator(
#             full_name=full_name,
#             campus_id=campus_id,
#             section_id=section_id,
#             **kwargs
#         )
#         coordinator.save()
#         return CreateCoordinator(coordinator=coordinator)


# class Mutation(graphene.ObjectType):
#     create_coordinator = CreateCoordinator.Field()


# # ============================
# # Root Schema
# # ============================

# schema = graphene.Schema(query=Query, mutation=Mutation)
