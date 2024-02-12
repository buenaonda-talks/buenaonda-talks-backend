# BuenaOnda Talks Backend

## Acerca del Proyecto

**BuenaOnda Talks** es una iniciativa comprometida con la democratización del aprendizaje de programación. A través de becas, buscamos eliminar barreras económicas y culturales que impiden a las personas acceder a educación de calidad en tecnología. El backend de **BuenaOnda Talks**, alojado en este repositorio, es una pieza clave en esta misión, facilitando la gestión de usuarios, la aplicación a becas, el envío de notificaciones y mucho más.

## Herramientas y Servicios Utilizados

Este proyecto es el resultado de la integración de tecnologías y servicios enfocados en maximizar la eficiencia y seguridad:

-   **[Clerk](https://clerk.dev/):** Nos permite ofrecer una experiencia de autenticación segura y sin fricciones para nuestros usuarios.
-   **[Turso](https://turso.tech/):** A través de esta moderna base de datos SQL y el ORM Drizzle, modelamos y accedemos a los datos de manera eficiente y segura.
-   **[Postmark](https://postmarkapp.com/):** Confiamos en Postmark para el envío confiable de correos electrónicos transaccionales, como notificaciones de becas y confirmaciones.
-   **[React Email](https://www.npmjs.com/package/react-email):** Esta librería nos permite construir y enviar correos electrónicos utilizando React, aprovechando su poder para crear diseños reutilizables y consistentes.
-   **[Drizzle ORM](https://orm.drizzle.team):** Drizzle es un ORM moderno y seguro para TypeScript, que nos permite interactuar con nuestra base de datos de manera eficiente y segura.
-   **[GraphQL Yoga](https://the-guild.dev/graphql/yoga-server):** Utilizamos GraphQL Yoga para crear un servidor de GraphQL con Node.js, que nos permite definir un esquema de datos y resolver consultas y mutaciones de manera eficiente.
-   **[Pothos Graphql](https://www.npmjs.com/package/@pothos/core):** Pothos es un constructor de esquemas de GraphQL basado en plugins para TypeScript, que nos permite construir esquemas de GraphQL de manera fácil, rápida y agradable.
-   **[Bull](https://optimalbits.github.io/bull/):** Utilizamos Bull para gestionar colas de trabajos, como el envío de correos electrónicos y otras tareas asíncronas. Además, utilizamos [Bull Board](https://github.com/felixmosh/bull-board) para supervisar y gestionar estas colas en tiempo real.

## Primeros Pasos

Antes de sumergirte en el desarrollo o la contribución a este proyecto, necesitarás preparar tu entorno.

### Requisitos Previos

Asegúrate de tener [Node.js](https://nodejs.org/) y yarn instalados. Estas herramientas son esenciales para el manejo de dependencias y la ejecución de nuestro proyecto.

### Clonación del Repositorio

Empieza por clonar este repositorio en tu máquina local usando el siguiente comando:

```bash
git clone https://github.com/buenaonda-talks/buenaonda-talks-backend.git
cd buenaonda-talks-backend
```

### Configuración de Variables de Entorno

Las claves de API y otros secretos no se almacenan directamente en el código. Para configurarlos:

1. Copia `.env.example` a `.env`:

    ```bash
    cp .env.example .env
    ```

2. Llena los valores en `.env` con tus propias claves de API y configuraciones, obtenidas de las plataformas respectivas.

### Instalación de Dependencias

Instala todas las dependencias necesarias con yarn:

```bash
yarn install
```

### Migración de la Base de Datos

Para configurar tu base de datos localmente, ejecuta las migraciones necesarias:

```bash
yarn db:migrate
```

Este paso prepara tu base de datos para el proyecto, creando todas las tablas necesarias.

Para incorporar una sección sobre Redis y cómo este se integra con Bull para la gestión de colas en el proyecto **BuenaOnda Talks API**, podrías añadir el siguiente contenido al `README.md`:

### Configuración de Redis

**BuenaOnda Talks API** aprovecha la potencia de **Redis** como almacén de datos en memoria para gestionar las colas de trabajos con **Bull**. Redis, conocido por su alta velocidad y eficiencia, es fundamental para operaciones que requieren un rápido acceso a los datos, como la gestión de colas de tareas asíncronas.

Para utilizar Redis con Bull en nuestro proyecto, seguimos estos pasos:

1. **Instalación de Redis:** Asegúrate de que Redis esté instalado y ejecutándose en tu entorno de desarrollo. Puedes descargarlo desde [la página oficial de Redis](https://redis.io/download).

2. **Configuración de Conexión:** Establece la conexión a Redis especificando el host, puerto y, si es necesario, la contraseña en las variables de entorno. Esto se hace en el archivo `.env`.

### Inicio del Servidor de Desarrollo

Genial, en este punto ya deberías estar listo para iniciar el servidor de desarrollo.

Arranca el servidor de desarrollo con:

```bash
yarn dev
```

Ahora podrás acceder al endpoint de GraphQL en [http://localhost:8787/graphql](http://localhost:8787/graphql) y empezar a experimentar con las queries y mutaciones.

## Desarrollo y Calidad del Código

Mantenemos un alto estándar de calidad del código utilizando herramientas como ESLint y Prettier, y facilitamos el desarrollo con Nodemon y ts-node. Sigue nuestras guías de estilo y buenas prácticas para contribuir al proyecto.

## Uso de React Email

Para diseñar y enviar correos electrónicos, seguimos un enfoque basado en componentes con React Email. Encuentra y crea plantillas de correo electrónico en la carpeta `emails`. Utiliza el entorno de desarrollo específico de correos electrónicos para ver tus cambios en tiempo real:

```bash
yarn email:dev
```

Claro, incorporar una sección específica sobre **Bull** y **Bull Board** en el `README.md` proporcionará a los desarrolladores una mejor comprensión de cómo se manejan las colas de trabajos y la monitorización de estos en el proyecto **BuenaOnda Talks API**. Aquí tienes un ejemplo de cómo podrías estructurar esta sección:

## Gestión de Colas con Bull y Bull Board

**BuenaOnda Talks API** utiliza **Bull** para manejar las operaciones en cola, como el envío de correos electrónicos y tareas en segundo plano que requieren procesamiento asincrónico. Bull es un paquete de Node.js que facilita la creación, gestión y procesamiento de colas de trabajos con robustez y flexibilidad.

### Monitorización con Bull Board:

Para supervisar y gestionar las colas de trabajos en tiempo real, utilizamos **Bull Board**, una interfaz de usuario que proporciona una visión detallada del estado de las colas. Bull Board hace posible:

-   **Visualizar trabajos:** Muestra trabajos en cola, en proceso, completados o fallidos.
-   **Gestionar trabajos:** Permite reintentar trabajos fallidos o eliminar trabajos de la cola.
-   **Inspeccionar trabajos:** Ofrece la capacidad de ver los detalles específicos de cada trabajo, incluyendo sus datos y el estado.

### Acceso a Bull Board

Para acceder a la interfaz de Bull Board, debes tener el servidor de desarrollo en ejecución. Luego, visita [http://localhost:8787/admin/login](http://localhost:8787/admin/login) en tu navegador.

En la página de inicio de sesión, introduce las credenciales de administrador para acceder a la interfaz de Bull Board.

Las credenciales son configurables en el archivo `.env` bajo las variables `BULL_ADMIN_USERNAME` y `BULL_ADMIN_PASSWORD`.

## Despliegue

Para desplegar la aplicación en un servidor, se puede utilizar Docker y CircleCI para automatizar el proceso. A continuación se detallan los pasos para configurar el entorno en un droplet de DigitalOcean y en CircleCI.

### Configuración del Entorno en el Droplet

1. **Conectarse por SSH al Droplet**:
   Abre una terminal y utiliza SSH para conectarte a tu droplet de DigitalOcean.

    ```bash
    ssh xxxxxxxxxx@xxxxxxxxxxxxxxxx
    ```

2. **Descargar la Imagen de Docker**:

    Una vez conectado, descarga la imagen de Docker Hub.

    ```bash
    docker pull textcode/buenaonda-talks-backend
    ```

3. **Ejecuta la aplicación con Docker y Docker Compose**:

    Utiliza Docker Compose para ejecutar la aplicación.

    Para esto tenemos dos archivos diferentes muy similares, en distintas carpetas, uno para producción y otro para desarrollo.

    El archivo `docker-compose.yml` trabaja en conjunto con el archivo `.env` para configurar las variables de entorno necesarias para la aplicación en producción y además trabaja con CircleCI para el tag dinámico de la imagen de Docker.

    Un archivo de ejemplo para el `docker-compose.yml` es el siguiente:

    ```yml
    version: '3.8'

    services:
    app:
        image: '${IMAGE_NAME}' # Use the image built by CircleCI
        ports:
            - '<PUERTO>:3000'
        environment:
            - NODE_ENV=staging
        env_file:
            - .env
        depends_on:
            - redis

    redis:
        image: 'redis:alpine'
    ```

### Configuración del Entorno en CircleCI

1. **Agregar Variables de Entorno en CircleCI**:

    Para que CircleCI pueda desplegar tu aplicación, agrega las variables de entorno necesarias en la configuración del proyecto en CircleCI.

    - `DOCKERHUB_USERNAME`: Tu nombre de usuario de Docker Hub.
    - `DOCKERHUB_PASSWORD`: Tu contraseña o token de acceso de Docker Hub.
    - `DOCKER_REPOSITORY`: El nombre de tu repositorio de Docker Hub.
    - `SSH_HOST`: La dirección IP de tu droplet de DigitalOcean.
    - `SSH_USER`: El nombre de usuario para el acceso SSH a tu droplet.

2. **Agregar Clave SSH a CircleCI**:

    - Genera un par de claves SSH si aún no lo has hecho, o utiliza uno existente.
    - Agrega la clave pública al archivo `~/.ssh/authorized_keys` en tu droplet.
    - Agrega la clave privada a CircleCI en la configuración del proyecto en la sección de claves SSH.

3. **Actualizar la Configuración de CircleCI**:

    La configuración del CI se encuentra en `.circleci/config.yml` si necesitas ajustar los pasos para el despliegue, incluyendo el build de la imagen de Docker y el push a Docker Hub, así como el despliegue en el droplet de DigitalOcean a través de SSH junto a docker-compose.

## Licencia

Este proyecto está bajo la licencia MIT. Esto significa que tienes amplia libertad para modificar, distribuir o incluso comercializar este software, siempre que incluyas el texto original de la licencia en cualquier versión redistribuida.
