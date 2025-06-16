from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Rubrique, SousRubrique, UserAccess


class SousRubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SousRubrique
        fields = ['id', 'title', 'slug', 'powerbi_url']


class RubriqueSerializer(serializers.ModelSerializer):
    sous_rubriques = SousRubriqueSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrique
        fields = ['id', 'title', 'slug', 'powerbi_url', 'sous_rubriques']


class UserAccessSerializer(serializers.ModelSerializer):
    rubrique = RubriqueSerializer()
    sous_rubrique = SousRubriqueSerializer()

    class Meta:
        model = UserAccess
        fields = ['id', 'rubrique', 'sous_rubrique']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        acces = UserAccess.objects.filter(user=user)
        acces_list = []
        for a in acces:
            acces_list.append({
                "rubrique": a.rubrique.title,
                "rubrique_slug": a.rubrique.slug,
                "rubrique_powerbi_url": a.rubrique.powerbi_url,
                "sous_rubrique": a.sous_rubrique.title if a.sous_rubrique else None,
                "sous_rubrique_slug": a.sous_rubrique.slug if a.sous_rubrique else None,
                "sous_rubrique_powerbi_url": a.sous_rubrique.powerbi_url if a.sous_rubrique else None,
            })
        token['permissions'] = acces_list
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['email'] = self.user.email
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name

        acces = UserAccess.objects.filter(user=self.user)
        acces_list = []
        for a in acces:
            acces_list.append({
                "rubrique": a.rubrique.title,
                "rubrique_slug": a.rubrique.slug,
                "rubrique_powerbi_url": a.rubrique.powerbi_url,
                "sous_rubrique": a.sous_rubrique.title if a.sous_rubrique else None,
                "sous_rubrique_slug": a.sous_rubrique.slug if a.sous_rubrique else None,
                "sous_rubrique_powerbi_url": a.sous_rubrique.powerbi_url if a.sous_rubrique else None,
            })
        data['permissions'] = acces_list

        return data
