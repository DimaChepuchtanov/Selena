"""Dedicated management serializers; the existing ProductSerializer is not replaced."""
from rest_framework import serializers
from .models import ProductCatalog, ProductCard, ProductImage


class CatalogSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductCatalog
        fields = ('id', 'name', 'product_count')


class ProductWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    describe = serializers.CharField(allow_blank=True, required=False, default='')
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0)
    catalog = serializers.PrimaryKeyRelatedField(queryset=ProductCatalog.objects.all())
    is_published = serializers.BooleanField(default=False, required=False)

    def validate_name(self, value):
        value = value.strip()
        exists = ProductCard.objects.filter(name__iexact=value)
        if self.instance:
            exists = exists.exclude(pk=self.instance.pk)
        if exists.exists():
            raise serializers.ValidationError('Карточка с таким названием уже существует.')
        return value

    def create(self, validated_data):
        return ProductCard.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save(update_fields=list(validated_data.keys()))
        return instance


class ImageInfoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'url', 'is_primary')

    def get_url(self, obj):
        return obj.img.url if obj.img else None


class AdminProductSerializer(serializers.ModelSerializer):
    catalog_name = serializers.CharField(source='catalog.name', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductCard
        fields = (
            'uuid', 'name', 'describe', 'price', 'stock', 'catalog',
            'catalog_name', 'is_published', 'created_at', 'images',
        )

    def get_images(self, obj):
        photos = sorted(obj.images.all(), key=lambda photo: (not photo.is_primary, photo.pk))
        return ImageInfoSerializer(photos, many=True).data


class UploadImageSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, file):
        if file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Максимальный размер изображения — 10 МБ.')
        return file
