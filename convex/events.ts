import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


export type Metrics = {
  soldTickets: number;
  refundedTickets: number;
  cancelledTickets: number;
  revenue: number;
};


export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(), // Store as timestamp
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
    });
    return eventId;
  },
});



// Get user's tickets with event information
export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          event,
        };
      })
    );

    return ticketsWithEvents;
  },
});



export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
      );
    });
  },
});

export const getSellerEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // For each event, get ticket sales data
    const eventsWithMetrics = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const validTickets = tickets.filter(
          (t) => t.status === "valid" || t.status === "used"
        );
        const refundedTickets = tickets.filter((t) => t.status === "refunded");
        const cancelledTickets = tickets.filter(
          (t) => t.status === "cancelled"
        );

        const metrics: Metrics = {
          soldTickets: validTickets.length,
          refundedTickets: refundedTickets.length,
          cancelledTickets: cancelledTickets.length,
          revenue: validTickets.length * event.price,
        };

        return {
          ...event,
          metrics,
        };
      })
    );

    return eventsWithMetrics;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Get current event to check tickets sold
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    // Ensure new total tickets is not less than sold tickets
    if (updates.totalTickets < soldTickets.length) {
      throw new Error(
        `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(eventId, updates);
    return eventId;
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    if (tickets.length > 0) {
      throw new Error(
        "Cannot cancel event with active tickets. Please refund all tickets first."
      );
    }

    // Mark event as cancelled
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });

    // Delete any waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect();

    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});