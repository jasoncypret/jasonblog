---

title: "Tiny Agents, Not AGI: Building a 5-Node Marketing-Idea Generator in n8n"
date: 2025-05-14 16:32 UTC
tags: AI, n8n
image: articles/tiny-agents-not-agi-building-a-5-node-marketing-idea-generator-in-n8n/simple-n8n-workflow.webp
open_graph_image: articles/tiny-agents-not-agi-building-a-5-node-marketing-idea-generator-in-n8n/simple-n8n-workflow.webp
summary: A day of AI insights, highlighting its impact on productivity, customer experience, and the future of enterprise applications.

---

> **tl;dr** "Agents" sound intimidating, but the smallest useful one I've built
> fits neatly into a five-node n8n workflow that runs every Monday, creates
> *fresh* marketing ideas for BoxBoard, and stores them for later use.

---

## 1. Wait—what *is* an "agent"?

If you've opened LinkedIn or Product Hunt in the last year, you've heard
> "Our platform now supports **agents**!"

Under the hood, most of those agents are just **workflows** that contain at
least *one* step where an LLM makes a decision:

* **Trigger** – something kicks the flow off  
* **LLM call** – the "thinking" step  
* **Action** – data is stored, sent, or transformed  

That's it. 90 % plumbing, 10 % AI.

---

## 2. My use-case: weekly marketing inspiration

Every Monday I used to spend 20 minutes brainstorming LinkedIn ideas for
BoxBoard. That's precisely the kind of low-leverage chore automations love.

### The *initial* 4-node proof-of-concept

1. **Cron Trigger** – fires at 08:00 on Mondays  
2. **OpenAI** – "Give me 10 marketing post ideas for BoxBoard."  
3. **Code** – turn the JSON into rows  
4. **Postgres Insert** – save into `marketing_ideas`  

It worked! But after week two the model repeated itself—classic LLM amnesia.

### The *current* 5-node version  
(Screenshot below)

1. **Cron Trigger**  
2. **Postgres Select** – pull last week's ideas  
3. **OpenAI** – *"Give me 10 **new** ideas not found in this list..."*  
4. **Code** – format rows  
5. **Postgres Insert** – write the fresh set  

![n8n workflow: cron → Postgres select → OpenAI → code → Postgres insert](articles/tiny-agents-not-agi-building-a-5-node-marketing-idea-generator-in-n8n/simple-n8n-workflow.webp "Five-node n8n flow that generates new marketing ideas and stores them in Postgres")

---

## 3. Why Postgres and not Sheets / Airtable?

* **Deduping & filtering** – `SELECT DISTINCT` is trivial in SQL.  
* **Joins** – later I can enrich ideas with performance metrics.  
* **Scalability** – when this grows into a full "marketing squad" of flows,
  I already have a relational backbone.  
* **Rails front-end** – I surface the table in a lightweight admin panel; no
  zap-to-sheet gymnastics.

Use whatever datastore fits your stack, but SQL saves future you a refactor.

---

## 4. Extending the agent

* **Add a Slack node** – DM myself the top idea every Monday morning.  
* **Hook into Notion** – auto-create a content brief with tone & target
  audience filled in.  
* **Feedback loop** – after a post goes live, write engagement stats back to
  Postgres so the next prompt can prioritize high-performing themes.

---

## 5. Takeaways

1. *Small is beautiful.* An "agent" can start with one LLM call and still
   deliver real value.  
2. *Think like a PM.* Break ambitious ideas into tiny shippable tasks; wire
   them; iterate.  
3. *Data matters.* Choosing a real database early unlocks smarter prompts and
   future automation layers.

Where could a five-node flow erase your Monday busywork?

---

*Questions or war stories about your own tiny agents?  
Ping me on Twitter—always happy to swap notes.*