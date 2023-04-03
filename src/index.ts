// imports
import express from "express";
import cors from "cors";

// local imports
import { db } from "./firebase";

// interfaces
interface ITicket {
  title: string;
  description: string;
  currentState: string;
  createdAt: string;
}

// defaults
const app = express();
app.use(express.json());
app.use(cors());

// commons
function validateTicket(ticket: ITicket): { valid: boolean; message?: string } {
  if (!ticket.title || typeof ticket.title !== "string") {
    return { valid: false, message: "Invalid or missing title" };
  }
  if (!ticket.description || typeof ticket.description !== "string") {
    return { valid: false, message: "Invalid or missing description" };
  }
  if (!ticket.currentState || typeof ticket.currentState !== "string") {
    return { valid: false, message: "Invalid or missing currentState" };
  }
  if (!ticket.createdAt || typeof ticket.createdAt !== "string") {
    return { valid: false, message: "Invalid or missing createdAt" };
  }

  return { valid: true };
}

// Fetch all tickets
app.get("/api/v1/tickets", async (req, res) => {
  try {
    const snapshot = await db.collection("tickets").get();
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(tickets);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// Create a new ticket
app.post("/api/v1/tickets", async (req, res) => {
  try {
    const ticket = req.body;
    const validationResult = validateTicket(ticket);

    if (!validationResult.valid) {
      res.status(400).json({ error: validationResult.message });
      return;
    }

    const ticketRef = await db.collection("tickets").add(ticket);
    res.status(201).json({ id: ticketRef.id, ...ticket });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// Update a ticket status
app.patch("/api/v1/tickets/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { currentState } = req.body;
    await db
      .collection("tickets")
      .doc(ticketId)
      .update({ currentState: currentState });
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
