const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');

const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const processorId = process.env.PROCESSOR_ID;
const bqTable = process.env.BQ_TABLE;

exports.processPdf = async (event, context) => {
  const file = event.name;
  const bucket = event.bucket;

  if (!file.endsWith('.pdf')) {
    console.log(`⏭️ Skipping non-PDF file: ${file}`);
    return;
  }

  if (!file.startsWith('upload/')) {
    console.log(`⏭️ Skipping file not in upload/ folder: ${file}`);
    return;
  }

  if (!projectId || !location || !processorId || !bqTable) {
    throw new Error("❌ Missing one or more required environment variables: PROJECT_ID, LOCATION, PROCESSOR_ID, BQ_TABLE");
  }

  const gcsInputUri = `gs://${bucket}/${file}`;
  const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const client = new DocumentProcessorServiceClient();
  const storage = new Storage();

  console.log(`📄 New file detected: ${file}`);
  console.log(`📦 Document AI Request Payload:`);
  console.log(`➡️ Processor Name: ${processorName}`);
  console.log(`➡️ MIME Type: application/pdf`);
  console.log(`➡️ GCS Input URI: ${gcsInputUri}`);

  try {
    const fileBuffer = (await storage.bucket(bucket).file(file).download())[0];

    const [result] = await client.processDocument({
      name: processorName,
      rawDocument: {
        content: fileBuffer,
        mimeType: 'application/pdf',
      },
    });

    const document = result.document;
    console.log(`✅ Document processed successfully. Found ${document.entities.length} entities.`);

    console.log("🔎 Raw Entities from Document:");
    console.log(JSON.stringify(document.entities, null, 2));

    const mapped = {
      PatientName: "",
      DateofBirth: null,
      Gender: "",
      ContactNumber: "",
      Address: "",
      InsuranceProvider: "",
      Symptoms: "",
      DoctorName: "",
      AppointmentDate: null,
      confidence: 0,
      DocName: file,
      ProcessedAt: new Date().toISOString()
    };

    let totalConfidence = 0, count = 0;

    for (const entity of document.entities) {
      const key = entity.type;
      const value = entity.mentionText?.trim();
      const confidence = entity.confidence || 0;

      if (mapped.hasOwnProperty(key)) {
        mapped[key] = value;
        totalConfidence += confidence;
        count++;
      }
    }

    if (count > 0) {
      mapped.confidence = +(totalConfidence / count).toFixed(4);
    }

    console.log("📝 Row to insert into BigQuery:");
    console.log(JSON.stringify(mapped, null, 2));

    const bigquery = new BigQuery();

    try {
      await bigquery
        .dataset(bqTable.split('.')[1])
        .table(bqTable.split('.')[2])
        .insert([mapped]);
      console.log(`✅ Inserted record into BigQuery table: ${bqTable}`);
    } catch (e) {
      if (e.name === 'PartialFailureError') {
        console.error("⚠️ Some rows failed to insert into BigQuery:");
        e.errors.forEach(err => console.error(JSON.stringify(err, null, 2)));
      } else {
        console.error("❌ Unexpected BigQuery error:", e.message);
      }
      throw e;
    }

    const archivePath = `archive/${file.split('/').pop()}`;
    await storage.bucket(bucket).file(file).move(archivePath);
    console.log(`📦 Archived processed file to: ${archivePath}`);
  } catch (err) {
    console.error("❌ Error during processing:");
    console.error(err.message);
    console.error(err.stack);
    throw err;
  }
};
