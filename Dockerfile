FROM python:2.7

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./requirements.txt /usr/src/app
RUN apt-get update \
    && apt-get install -y python-dev
RUN pip install -r requirements.txt

COPY ./ /usr/src/app
CMD ["python", "app.py"]