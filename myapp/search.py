from datetime import datetime
from elasticsearch_dsl import Document, Date, Keyword, Text
from elasticsearch_dsl.connections import connections

# Define a default Elasticsearch client
connections.create_connection(hosts=['localhost'])
