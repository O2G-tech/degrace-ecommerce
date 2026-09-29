FROM php:8.2-apache

# Install required system packages and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql zip

# Enable Apache rewrite module and headers
RUN a2enmod rewrite headers

# Copy application files
COPY . /var/www/html/

# Set proper permissions for uploads directory
RUN mkdir -p /var/www/html/uploads/products /var/www/html/uploads/categories \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/uploads

# Configure dynamic port for cloud platforms (Render, Railway, etc.)
ENV PORT=80
EXPOSE 80

CMD sed -i "s/80/$PORT/g" /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf && apache2-foreground
