import { NextRequest, NextResponse } from "next/server";

interface FineTuningJob {
  id: string;
  model: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  finished_at?: string;
  training_file: string;
  validation_file?: string;
  hyperparameters: {
    n_epochs: number;
    batch_size: number;
    learning_rate: number;
  };
  result_files?: string[];
  trained_tokens?: number;
  error?: string;
}

// In-memory storage for demo purposes
let fineTuningJobs: FineTuningJob[] = [
  {
    id: "ft-job-1",
    model: "phi:latest",
    status: "completed",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    training_file: "training_data.jsonl",
    validation_file: "validation_data.jsonl",
    hyperparameters: {
      n_epochs: 3,
      batch_size: 4,
      learning_rate: 0.0001
    },
    result_files: ["phi-ft-model.bin"],
    trained_tokens: 125000
  },
  {
    id: "ft-job-2",
    model: "phi:latest",
    status: "running",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    training_file: "custom_training.jsonl",
    hyperparameters: {
      n_epochs: 5,
      batch_size: 8,
      learning_rate: 0.00005
    },
    trained_tokens: 45000
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      jobs: fineTuningJobs,
      total: fineTuningJobs.length
    });
  } catch (error) {
    console.error("Fine-tuning API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fine-tuning jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      model, 
      training_file, 
      validation_file,
      hyperparameters 
    } = await request.json();

    if (!model || !training_file) {
      return NextResponse.json(
        { error: "Model and training file are required" },
        { status: 400 }
      );
    }

    // Create new fine-tuning job
    const newJob: FineTuningJob = {
      id: `ft-job-${Date.now()}`,
      model,
      status: "pending",
      created_at: new Date().toISOString(),
      training_file,
      validation_file,
      hyperparameters: {
        n_epochs: hyperparameters?.n_epochs || 3,
        batch_size: hyperparameters?.batch_size || 4,
        learning_rate: hyperparameters?.learning_rate || 0.0001
      }
    };

    fineTuningJobs.unshift(newJob);

    // Simulate job progression
    setTimeout(() => {
      const job = fineTuningJobs.find(j => j.id === newJob.id);
      if (job) {
        job.status = "running";
      }
    }, 2000);

    setTimeout(() => {
      const job = fineTuningJobs.find(j => j.id === newJob.id);
      if (job) {
        job.status = "completed";
        job.finished_at = new Date().toISOString();
        job.result_files = [`${model}-ft-${Date.now()}.bin`];
        job.trained_tokens = Math.floor(Math.random() * 100000) + 50000;
      }
    }, 30000); // Complete after 30 seconds for demo

    return NextResponse.json(newJob);
  } catch (error) {
    console.error("Fine-tuning creation error:", error);
    return NextResponse.json(
      { error: "Failed to create fine-tuning job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const jobIndex = fineTuningJobs.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const job = fineTuningJobs[jobIndex];
    
    if (job.status === "running") {
      return NextResponse.json(
        { error: "Cannot delete running job" },
        { status: 400 }
      );
    }

    fineTuningJobs.splice(jobIndex, 1);

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Fine-tuning deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete fine-tuning job" },
      { status: 500 }
    );
  }
} 