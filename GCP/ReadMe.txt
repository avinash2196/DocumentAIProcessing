gcloud services enable documentai.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable eventarc.googleapis.com


gcloud projects add-iam-policy-binding your-project-id   --member=serviceAccount:PROJECT_ID@appspot.gserviceaccount.com   --role=roles/eventarc.admin

gcloud projects add-iam-policy-binding your-project-id \
  --member=serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
  --role=roles/run.invoker

gcloud projects add-iam-policy-binding your-project-id \
  --member=serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
  --role=roles/storage.objectViewer

gcloud iam service-accounts create my-eventarc-sa \
    --description="Custom Service Account for Eventarc trigger" \
    --display-name="My Eventarc SA"

# Allow access to Cloud Storage
gcloud projects add-iam-policy-binding <project-id> --member="serviceAccount:my-eventarc-sa@<project-id>.iam.gserviceaccount.com" 
  --role="roles/storage.objectViewer"

# Allow to act as Cloud Run service (if needed)
gcloud projects add-iam-policy-binding  <project-id>  --member="serviceAccount:my-eventarc-sa@<project-id>.iam.gserviceaccount.com" --role="roles/run.invoker"

# (Optional) For PubSub triggers
gcloud projects add-iam-policy-binding <project-id> --member="serviceAccount:service-<project-number>@gs-project-accounts.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"


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

gcloud projects describe soum-392714 --format="value(projectNumber)"
gcloud storage buckets add-iam-policy-binding gs://<bucket-name> \
  --member="serviceAccount:<project-number.@gcp-sa-eventarc.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
Create a Node.js Function

                     
