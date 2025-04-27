gcloud services enable documentai.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable eventarc.googleapis.com
gcloud services enable eventarcstorage.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com


Create a GCS Bucket to upload PDFs:

Create a BigQuery Dataset and Table:

Go to BigQuery console.

Create Dataset (e.g., docai_dataset).

Create a Table with fields you expect from the PDF (e.g., invoice_id, amount, date etc.).

Step 2: Create a Custom Document AI Processor
Go to Document AI console: https://console.cloud.google.com/ai/document-ai/

Click Create Processor → Choose Custom Extraction Processor.

Give it a name (e.g., custom-pdf-extractor).

Region: us-central1 (important, especially if you deploy later).

Click Create.

Train / Use the Custom Processor
Create a Node.js Function

                     
