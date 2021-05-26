FROM python:3.6

RUN mkdir /opt/postgres-data

# set work directory
WORKDIR /opt/api

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_ENV development
ENV FLASK_DEBUG 1
ENV FLASK_APP run.py

# install postgres client
RUN apt update && \
      apt install postgresql-client -y && \
      rm -rf /var/cache/apt/archives

# install dependencies
RUN pip install --upgrade pip
RUN pip install pipenv
COPY ./Pipfile .
RUN export LDFLAGS="-L/usr/local/opt/openssl/lib"
RUN pipenv install --system --skip-lock --dev --deploy

# Setup a Development User
RUN useradd -ms /bin/bash postscript 
USER postscript

# copy project
COPY . .

# Run Commands
EXPOSE 5000
ENTRYPOINT ["/opt/api/cmds/entrypoint.sh"]
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
# CMD ["gunicorn", "--user=postscript", "--bind=0.0.0.0:5000", "run:app"]