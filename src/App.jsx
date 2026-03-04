import { useState, useEffect, useRef } from "react";
import G6 from "@antv/g6";

const TOPIC_COLORS = {
  0: "#8c8fae", 1: "#584563", 2: "#9a6348", 3: "#c0c741",
  4: "#e4943a", 5: "#d26471", 6: "#34859d", 7: "#70377f",
};

const TOPIC_NAMES = {
  0: "pedagogical agent design",
  1: "teachable agents & learning-by-teaching",
  2: "scaffolding & instructional support",
  3: "mathematics learning",
  4: "student motivation & engagement",
  5: "social acceptance & interaction",
  6: "learning outcomes & transfer",
  7: "special populations & accessibility",
};

const PAPERS = [{"id":0,"t":"\"I didn't understand, i'm really not very smart\"--how design of a digital tutee'","p":1,"a":[1,4],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":1,"t":"A Virtual Reality Based System for the Screening and Classification of Autism.","p":7,"a":[7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":2,"t":"Virtual Humans to Manage Epistemic Emotions in Educational Virtual Worlds","p":4,"a":[4,0],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":3,"t":"Investigating the impact of pedagogical agent gender matching and learner choice","p":0,"a":[0],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":4,"t":"Dynamic scaffolding of socially regulated learning in a computer-based learning","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":5,"t":"The pedagogical agent enhances mathematics learning in ADHD students.","p":7,"a":[3,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":6,"t":"Strategy instruction in early childhood math software: detecting and teaching si","p":3,"a":[3,0],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving"},{"id":7,"t":"An exploratory study on how children interact with pedagogic conversational agen","p":5,"a":[5,0],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":8,"t":"Pedagogical Agent Gestures to Improve Learner Comprehension of Abstract Concepts","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":9,"t":"The impacts of automatic scaffolding on students' acquisition of data collection","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":10,"t":"Learning-by-Teaching: Designing Teachable Agents with Intrinsic Motivation","p":1,"a":[1,4],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":11,"t":"Digital guidance for susceptible readers: effects on fifth graders' reading moti","p":7,"a":[7,4],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":12,"t":"The impact of pedagogical agent on learners' motivation and academic success","p":4,"a":[4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":13,"t":"High Support Need and Minimally Verbal Children with Autism Playing a Preference","p":7,"a":[7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":14,"t":"Interactive Multimedia Module with Pedagogical Agents: Formative Evaluation","p":4,"a":[4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":15,"t":"Pipetting in virtual reality can predict real-life pipetting performance","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":16,"t":"Effects of Pedagogical Agent Gestures on Social Acceptance and Learning","p":0,"a":[0,5,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":17,"t":"Embodied agent in tutor role: effects on field dependent and independent","p":0,"a":[0,4,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":18,"t":"The pedagogical agent in online learning: effects of the degree of realism","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":19,"t":"Construction and evaluation of animated teachable agents.","p":1,"a":[1,0],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":20,"t":"Assessing the black box of feedback neglect in a digital educational game","p":2,"a":[2,0],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":21,"t":"The effects of multiple-pedagogical agents on learners' academic success","p":0,"a":[0,4,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":22,"t":"Real-Time AI-Driven Assessment & Scaffolding That Improves Students' Math","p":2,"a":[2,3,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":23,"t":"How Character Customization Affects Learning in Computational Thinking","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":24,"t":"Investigating 5th-grade students' opinions towards using an Arabic agent","p":0,"a":[0,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":25,"t":"Mathgirls: toward developing girls' positive attitude and self-efficacy","p":4,"a":[4,3,0],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":26,"t":"Using virtual reality technology to improve reality for young people","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":27,"t":"Designing A Virtual Talking Companion to Support Social-Emotional Learning","p":7,"a":[7,4,0],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":28,"t":"Evaluating the affective tactics of an emotional pedagogical agent","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":29,"t":"A look at the roles of look & roles in embodied pedagogical agents","p":0,"a":[0,5],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":30,"t":"The role of learner attributes and affect determining the impact of agent","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":31,"t":"An intelligent pedagogical agent to foster computational thinking","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":32,"t":"Affective behavior control for lifelike pedagogical agents","p":0,"a":[0],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":33,"t":"Exploring acceptance of intelligent tutoring system with pedagogical agent","p":5,"a":[0,3,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":34,"t":"Teaching STEM through a Role-Playing Serious Game and Intelligent Agent","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":35,"t":"Modeling cognitive structure of emotion for developing a pedagogical agent","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":36,"t":"Predicting Dialogue Breakdown in Conversational Pedagogical Agents","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":37,"t":"A pilot RCT of virtual reality job interview training in transition-age youth","p":7,"a":[7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":38,"t":"Interactive multimedia module in the learning of electrochemistry","p":4,"a":[0,4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":39,"t":"An Investigation of Conversational Agent Interventions Supporting Historical","p":2,"a":[2,5],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":40,"t":"Examining dialogue initiative policies for conversational pedagogical agents","p":2,"a":[0,2],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":41,"t":"Modeling Math Identity and Math Success through Sentiment Analysis","p":4,"a":[3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":42,"t":"From deadpan machine to relating socially: Middle school students' experiences","p":5,"a":[0,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":43,"t":"Dynamically sequencing an animated pedagogical agent","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":44,"t":"Friendship with a robot: Children's perception of similarity","p":5,"a":[0,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":45,"t":"A Virtual Conversational Agent for Teens with Autism Spectrum Disorder","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":46,"t":"The Relationship between Carelessness and Affect in a Cognitive Tutor","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":47,"t":"An Agent Proposal for Reading Understanding Applied to Maths problems","p":3,"a":[3,4],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving"},{"id":48,"t":"Exploring the Sequences of Synthetic Facial Expressions and Problems Solved","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":49,"t":"Animated pedagogical agents and problem-solving effectiveness","p":6,"a":[0,6],"k":"learning outcomes; knowledge acquisition; retention; transfer; academic achievement"},{"id":50,"t":"Learning from the folly of others: Learning to self-correct by monitoring","p":1,"a":[1,3],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":51,"t":"How RU? Finding Out When to Help Students","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":52,"t":"Pedagogical agents in learning videos: which one is best for children?","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":53,"t":"Using narrative-based design scaffolds within a mobile learning environment","p":2,"a":[2],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":54,"t":"Knowledge-Based System in an Affective and Intelligent Tutoring System","p":3,"a":[3,4,2],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving"},{"id":55,"t":"Testing the Robustness of Inquiry Practices Once Scaffolding Is Removed","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":56,"t":"Who is more efficient: teacher or pedagogical agents?","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":57,"t":"Collaborative learning with affective artificial study companions","p":5,"a":[4,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":58,"t":"Development of an Arabic conversational intelligent tutoring system","p":7,"a":[7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":59,"t":"Enhancing middle school students' scientific learning and motivation","p":4,"a":[4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":60,"t":"Designing situated learning experiences for smart cities","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":61,"t":"Effects of pedagogical agents on students' mathematics performance","p":0,"a":[0,3,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":62,"t":"Development of a Positive Body Image Chatbot (KIT) With Young People","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":63,"t":"Does the effect of enthusiasm in a pedagogical agent's voice depend on load","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":64,"t":"Analysing the role of a pedagogical agent in psychological preparation","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":65,"t":"Ethorobotics applied to human behaviour: can animated objects influence","p":0,"a":[0,5],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":66,"t":"Pedagogical agents for fostering question-asking skills in children","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":67,"t":"Social gaze training for Autism Spectrum Disorder using eye-tracking","p":7,"a":[7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":68,"t":"The zoomorphic effect: a contribution to images of pedagogical agents","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":69,"t":"Effects of cueing by a pedagogical agent in an instructional animation","p":0,"a":[0,2,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":70,"t":"Conversational agents for fostering curiosity-driven learning in children","p":4,"a":[2,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":71,"t":"Learn wisdom by the folly of others: Children learning to self correct","p":1,"a":[1,2],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":72,"t":"Mobile App-Based Coaching for Alcohol Prevention among Adolescents","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":73,"t":"Let's teach kibot: discovering discussion patterns between student groups","p":1,"a":[1,5],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":74,"t":"Multimedia interfaces for users with high functioning autism","p":7,"a":[7,0],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":75,"t":"Gea2: A Serious Game for Technology-Enhanced Learning in STEM","p":0,"a":[0,2,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":76,"t":"Cultivating students' reflective learning in metacognitive activities","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":77,"t":"Animated pedagogical agents effects on enhancing student motivation","p":4,"a":[0,4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":78,"t":"A gender matching effect in learning with pedagogical agents in VR","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":79,"t":"Impact of interactive multimedia module with pedagogical agents","p":3,"a":[0,3,6],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving"},{"id":80,"t":"Effectiveness of interactive multimedia module with pedagogical agent","p":0,"a":[0,4,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":81,"t":"Classification of Public Elementary Students' Game Play Patterns","p":6,"a":[0,6],"k":"learning outcomes; knowledge acquisition; retention; transfer; academic achievement"},{"id":82,"t":"When educational agents meet surrogate competition","p":4,"a":[4,0],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":83,"t":"Educational interface agents as social models to influence learner achievement","p":0,"a":[0,4,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":84,"t":"Changing middle-school students' attitudes regarding engineering","p":4,"a":[0,4,3],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":85,"t":"The case for social agency in computer-based teaching","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":86,"t":"Computerized pedagogical agents as an educational means","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":87,"t":"The effect of an embedded pedagogical agent on science achievement","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":88,"t":"Designing agents to support learning by explaining","p":1,"a":[1,0],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":89,"t":"An investigation of the effectiveness of intelligent elaborative feedback","p":2,"a":[2,0,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":90,"t":"The effects of pedagogical agents on mathematics anxiety and learning","p":4,"a":[3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":91,"t":"Building an Emotional IPA Through Empirical Design With High-School Students","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":92,"t":"How 3d virtual humans built by adolescents with asd affect interactions","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":93,"t":"Improving virtual reality asd intervention games with 3d virtual humans","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":94,"t":"Curiosity Notebook: A Platform for Learning by Teaching Conversational Agents","p":1,"a":[1],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":95,"t":"Conversational agents as mediating social actors in chronic disease management","p":5,"a":[5],"k":"social acceptance; human-likeness; agent personality; interaction patterns; virtual relationships"},{"id":96,"t":"The impact of learner attributes and learner choice in an agent-based environment","p":0,"a":[0,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":97,"t":"An embodied agent helps anxious students in mathematics learning.","p":4,"a":[0,3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":98,"t":"Gendered socialization with an embodied agent: creating a social math env","p":4,"a":[0,3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":99,"t":"Effects of adaptive training on metacognitive knowledge monitoring ability","p":2,"a":[2,3],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":100,"t":"Pedagogical agent signaling of multiple visual engineering representations","p":0,"a":[0,2,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":101,"t":"Supporting multimedia learning with visual signalling and animated agent","p":0,"a":[0,2,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":102,"t":"Exploring a self-directed interactive app for informal EFL learning","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":103,"t":"A courseware to script animated pedagogical agents in instructional material","p":0,"a":[0],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":104,"t":"The Effect of Motivational Learning Companions on Low Achieving Students","p":4,"a":[4,7],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes"},{"id":105,"t":"Learning by Substitutive Competition: Nurturing My-Pet for Game Competition","p":1,"a":[1],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy; intrinsic motivation"},{"id":106,"t":"Improving the Metacognitive Ability of Knowledge Monitoring in Computer Learning","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring"},{"id":107,"t":"What Do Children Favor as Embodied Pedagogical Agents?","p":0,"a":[0,5],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":108,"t":"I built it — exploring the effects of customizable virtual humans on adolescents","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":109,"t":"Towards joint attention training for children with asd - a vr game approach","p":7,"a":[0,7],"k":"autism; ADHD; special needs; genetic factors; accessibility; individual differences"},{"id":110,"t":"A theory based adaptive pedagogical agent in a reading app for primary students","p":0,"a":[0,2,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"},{"id":111,"t":"Pedagogical voice in an e-learning system: content expert versus content novice","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents"}];

/* ─── Helpers ─────────────────────────────────────────────── */
function getClusterCenters(W, H) {
  const groups = [0, 1, 2, 3, 4, 5, 6, 7];
  const centers = {};
  groups.forEach((g, i) => {
    const angle = (i / groups.length) * 2 * Math.PI - Math.PI / 2;
    const r = Math.min(W, H) * 0.3;
    centers[g] = {
      x: W / 2 + r * Math.cos(angle),
      y: H / 2 + r * Math.sin(angle),
    };
  });
  return centers;
}

function buildSparseEdges() {
  // Build a connected backbone through each cluster (chain), plus 1 random extra per node.
  // This ensures cluster cohesion without O(n²) edge count.
  const byGroup = {};
  PAPERS.forEach(p => { (byGroup[p.p] = byGroup[p.p] || []).push(p.id); });

  const edgeSet = new Set();
  const edges = [];

  const addEdge = (a, b) => {
    const key = [a, b].sort((x, y) => x - y).join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ id: `e-${key}`, source: `n${a}`, target: `n${b}` });
    }
  };

  Object.values(byGroup).forEach(ids => {
    if (ids.length < 2) return;
    // Shuffle then chain — creates a spanning path through all nodes
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i++) {
      addEdge(shuffled[i], shuffled[i + 1]);
    }
    // One random extra per node (adds some cross-connections but keeps degree low)
    ids.forEach(id => {
      const others = ids.filter(x => x !== id);
      if (others.length === 0) return;
      const pick = others[Math.floor(Math.random() * others.length)];
      addEdge(id, pick);
    });
  });

  return edges;
}

/* ─── Ambient canvas background (no d3) ────────────────────── */
function AmbientGraph() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    const ctx = canvas.getContext("2d");
    const colors = Object.values(TOPIC_COLORS);

    const pts = Array.from({ length: 52 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: 2 + Math.random() * 5.5,
      color: colors[i % colors.length],
    }));

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      // draw edges between nearby pts
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(31,14,28,${0.05 * (1 - d / 115)})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }
      // draw nodes
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "2b";
        ctx.fill();
        ctx.strokeStyle = p.color + "3e";
        ctx.lineWidth = 1;
        ctx.stroke();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10 || p.x > W + 10) p.vx *= -1;
        if (p.y < -10 || p.y > H + 10) p.vy *= -1;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

/* ─── G6 Cluster graph ──────────────────────────────────────── */
function ClusterGraph({ activeTopics, onNodeHover }) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const centersRef = useRef({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth;
    const H = el.offsetHeight;

    const centers = getClusterCenters(W, H);
    centersRef.current = centers;

    const edges = buildSparseEdges();

    const nodes = PAPERS.map(p => ({
      id: `n${p.id}`,
      x: centers[p.p].x + (Math.random() - 0.5) * 40,
      y: centers[p.p].y + (Math.random() - 0.5) * 40,
      size: 14,
      // store paper data on node model
      _topic: p.p,
      _title: p.t,
      _keys: p.k,
      style: {
        fill: TOPIC_COLORS[p.p],
        stroke: "rgba(31,14,28,0.2)",
        lineWidth: 0.7,
        cursor: "pointer",
      },
    }));

    const graph = new G6.Graph({
      container: el,
      width: W,
      height: H,
      fitView: false,
      // Calm force layout: low energy, high damping, sparse edges mean
      // clusters naturally separate via repulsion + intra-cluster attraction
      layout: {
        type: "force",
        linkDistance: 30,        // short link = tight cluster
        nodeStrength: -18,       // mild repulsion between all nodes
        edgeStrength: 0.55,      // moderate attraction along edges
        preventOverlap: true,
        nodeSize: 14,
        damping: 0.97,           // very high damping = settles quickly
        alpha: 0.08,             // low initial energy = less chaos
        alphaDecay: 0.01,
        alphaMin: 0.001,
        // Cluster gravity: nudge nodes toward their cluster center each tick
        clustering: false,
        onTick: () => {
          const graphNodes = graph.getNodes();
          graphNodes.forEach(node => {
            const m = node.getModel();
            const c = centers[m._topic];
            if (!c) return;
            const item = node.get("layoutItemData") || {};
            if (item) {
              item.vx = (item.vx || 0) + (c.x - (m.x || c.x)) * 0.055; // was 0.012
              item.vy = (item.vy || 0) + (c.y - (m.y || c.y)) * 0.055;
            }
          });
        },
      },
      defaultEdge: {
        style: {
          stroke: "#1f0e1c",
          lineWidth: 0.75,
          opacity: 0.1,
        },
      },
      nodeStateStyles: {
        hover: {
          lineWidth: 2,
          stroke: "rgba(31,14,28,0.7)",
          shadowColor: "rgba(31,14,28,0.15)",
          shadowBlur: 8,
        },
      },
      modes: {
        default: ["drag-canvas", "zoom-canvas", "drag-node"],
      },
    });

    graph.data({ nodes, edges });
    graph.render();

    // ── Events
    graph.on("node:mouseenter", evt => {
      graph.setItemState(evt.item, "hover", true);
      const m = evt.item.getModel();
      const oe = evt.originalEvent || evt;
      onNodeHover({
        paper: { t: m._title, p: m._topic, k: m._keys },
        x: oe.clientX,
        y: oe.clientY,
      });
    });
    graph.on("node:mousemove", evt => {
      const m = evt.item.getModel();
      const oe = evt.originalEvent || evt;
      onNodeHover({
        paper: { t: m._title, p: m._topic, k: m._keys },
        x: oe.clientX,
        y: oe.clientY,
      });
    });
    graph.on("node:mouseleave", evt => {
      graph.setItemState(evt.item, "hover", false);
      onNodeHover(null);
    });
    graph.on("node:dragend", evt => {
      graph.updateItem(evt.item, { fx: null, fy: null }); 
      const sim = graph.get("layoutController")?.layoutMethods?.[0]?.simulation;
      if (sim) sim.alpha(0.15).restart();
    });

    graphRef.current = graph;
    return () => {
      if (graphRef.current) {
        try { graphRef.current.destroy(); } catch (_) {}
        graphRef.current = null;
      }
    };
  }, []);

  // ── Sync filter
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.getNodes().forEach(node => {
      const m = node.getModel();
      const active = !activeTopics || activeTopics.has(m._topic);
      graph.updateItem(node, {
        style: {
          fill: TOPIC_COLORS[m._topic],
          stroke: "rgba(31,14,28,0.2)",
          lineWidth: 0.7,
          opacity: active ? 1 : 0.08,
        },
      });
    });
    graph.getEdges().forEach(edge => {
      const src = edge.getSource().getModel();
      const active = !activeTopics || activeTopics.has(src._topic);
      graph.updateItem(edge, {
        style: { stroke: "#1f0e1c", lineWidth: 0.75, opacity: active ? 0.1 : 0.02 },
      });
    });
  }, [activeTopics]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* ─── Root app ──────────────────────────────────────────────── */
export default function Nodum() {
  const [view, setView] = useState("home");
  const [animating, setAnimating] = useState(false);
  const [groupBy, setGroupBy] = useState("primary topic");
  const [tooltip, setTooltip] = useState(null);
  const [activeTopics, setActiveTopics] = useState(null);

  const topicCounts = Object.keys(TOPIC_NAMES).map(k => ({
    id: +k,
    name: TOPIC_NAMES[k],
    count: PAPERS.filter(p => p.p === +k).length,
    color: TOPIC_COLORS[k],
  }));

  const goToGraph = () => {
    setAnimating(true);
    setTimeout(() => { setView("graph"); setAnimating(false); }, 600);
  };
  const goHome = () => { setView("home"); setActiveTopics(null); };

  const toggleTopic = id => setActiveTopics(prev => {
    if (prev === null) return new Set([id]);
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s.size === 0 ? null : s;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #f5edba; height: 100%; overflow: hidden; }

        .root {
          font-family: 'Rethink Sans', sans-serif;
          letter-spacing: -0.02em;
          background: #f5edba;
          color: #1f0e1c;
          width: 100vw; height: 100vh;
          overflow: hidden;
          position: relative;
        }

        /* ── HOME ──────────────────────────────────── */
        .home {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 0 9vw;
          transition: transform 0.6s cubic-bezier(0.76,0,0.24,1),
                      opacity 0.6s cubic-bezier(0.76,0,0.24,1);
          z-index: 2; overflow: hidden;
        }
        .home.exit { transform: translateY(-100%); opacity: 0; }
        .home-content { position: relative; z-index: 1; }

        .home-title {
          font-size: clamp(64px, 10.5vw, 152px);
          font-weight: 800;
          letter-spacing: -0.055em;
          line-height: 0.87;
          text-transform: lowercase;
          color: #1f0e1c;
        }
        .home-tagline {
          margin-top: 18px;
          font-size: clamp(13px, 1.2vw, 16px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: #1f0e1c;
          opacity: 0.4;
        }
        .home-actions {
          margin-top: 36px;
          display: flex; flex-direction: column;
          align-items: flex-start; gap: 11px;
        }

        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Rethink Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: -0.01em; text-transform: lowercase;
          color: #1f0e1c;
          border: 1.5px solid rgba(31,14,28,0.5);
          background: transparent;
          padding: 10px 26px; cursor: pointer; border-radius: 2px;
          transition: background 0.16s, color 0.16s, border-color 0.16s, opacity 0.16s;
          white-space: nowrap;
        }
        .btn:hover { background: #1f0e1c; color: #f5edba; border-color: #1f0e1c; }
        .btn.ghost { opacity: 0.5; font-size: 11.5px; padding: 8px 22px; }
        .btn.ghost:hover { opacity: 1; }
        .btn.full { width: 100%; font-size: 11px; padding: 7px 0; }

        /* ── GRAPH PAGE ────────────────────────────── */
        .graph-page {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          opacity: 0; transform: translateY(48px);
          transition: opacity 0.44s 0.14s ease, transform 0.44s 0.14s ease;
          pointer-events: none; z-index: 1;
        }
        .graph-page.visible { opacity: 1; transform: translateY(0); pointer-events: all; }

        /* NAV */
        .nav {
          height: 46px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 28px;
          border-bottom: 1px solid rgba(31,14,28,0.12);
          background: #f5edba; flex-shrink: 0;
        }
        .nav-logo { font-size: 17px; font-weight: 800; letter-spacing: -0.055em; text-transform: lowercase; }
        .nav-links { display: flex; gap: 24px; list-style: none; }
        .nav-links li {
          font-size: 11.5px; font-weight: 500;
          letter-spacing: -0.01em; text-transform: lowercase;
          opacity: 0.45; cursor: pointer; transition: opacity 0.14s;
        }
        .nav-links li:hover { opacity: 1; }
        .nav-links li.active { opacity: 1; font-weight: 700; }

        /* LAYOUT */
        .graph-main { flex: 1; display: flex; overflow: hidden; }
        .graph-canvas { flex: 1; position: relative; overflow: hidden; }
        .graph-hint {
          position: absolute; bottom: 14px; left: 16px;
          font-size: 10px; opacity: 0.22; letter-spacing: 0.01em; pointer-events: none;
        }

        /* SIDEBAR */
        .sidebar {
          width: 252px; flex-shrink: 0;
          border-left: 1px solid rgba(31,14,28,0.1);
          background: rgba(245,237,186,0.5);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .sb-sec { padding: 18px 18px 0; }
        .sb-lbl {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          opacity: 0.3; margin-bottom: 10px;
        }
        .group-opts { display: flex; flex-direction: column; gap: 2px; }
        .group-opt {
          font-size: 11.5px; font-weight: 500; letter-spacing: -0.01em;
          text-transform: lowercase; padding: 7px 10px;
          cursor: pointer; border-radius: 2px; transition: background 0.13s;
          display: flex; align-items: center; gap: 8px;
        }
        .group-opt:hover { background: rgba(31,14,28,0.06); }
        .group-opt.active { background: #1f0e1c; color: #f5edba; font-weight: 700; }
        .mini-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.5; flex-shrink: 0; }

        .divider { height: 1px; background: rgba(31,14,28,0.09); margin: 14px 18px; }

        .legend { flex: 1; overflow-y: auto; padding: 0 18px 18px; }
        .legend::-webkit-scrollbar { width: 3px; }
        .legend::-webkit-scrollbar-thumb { background: rgba(31,14,28,0.16); border-radius: 2px; }
        .leg-item {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 5px; border-radius: 3px;
          cursor: pointer; transition: background 0.12s, opacity 0.12s;
        }
        .leg-item:hover { background: rgba(31,14,28,0.05); }
        .leg-item.dim { opacity: 0.25; }
        .leg-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; transition: transform 0.12s; }
        .leg-item:hover .leg-dot { transform: scale(1.35); }
        .leg-name { font-size: 11px; font-weight: 500; letter-spacing: -0.01em; text-transform: lowercase; flex: 1; line-height: 1.3; }
        .leg-count { font-size: 10.5px; opacity: 0.35; font-weight: 600; }

        /* TOOLTIP */
        .tip {
          position: fixed; background: #1f0e1c; color: #f5edba;
          padding: 11px 15px; border-radius: 3px;
          max-width: 265px; pointer-events: none; z-index: 9999;
          font-family: 'Rethink Sans', sans-serif;
          font-size: 11.5px; letter-spacing: -0.01em; line-height: 1.5;
          box-shadow: 0 6px 26px rgba(31,14,28,0.22);
        }
        .tip-title { font-weight: 700; margin-bottom: 5px; font-size: 11.5px; line-height: 1.4; }
        .tip-topic { font-size: 10.5px; opacity: 0.52; text-transform: lowercase; margin-bottom: 3px; }
        .tip-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
        .tip-kw { font-size: 10px; opacity: 0.4; margin-top: 5px; font-style: italic; }
      `}</style>

      <div className="root">

        {/* ── HOME ──────────────────────────────── */}
        {view !== "graph" && (
          <div className={`home${animating ? " exit" : ""}`}>
            <AmbientGraph />
            <div className="home-content">
              <div className="home-title">nodum.</div>
              <div className="home-tagline">knowledge maps, made effortless.</div>
              <div className="home-actions">
                <button className="btn" onClick={goToGraph}>upload csv</button>
                <button className="btn ghost" onClick={goToGraph}>check out a demo</button>
              </div>
            </div>
          </div>
        )}

        {/* ── GRAPH PAGE ────────────────────────── */}
        <div className={`graph-page${view === "graph" ? " visible" : ""}`}>
          <nav className="nav">
            <span className="nav-logo">nodum.</span>
            <ul className="nav-links">
              <li onClick={goHome}>home</li>
              <li>new mapping — upload csv</li>
              <li className="active">demo</li>
            </ul>
          </nav>

          <div className="graph-main">
            <div className="graph-canvas">
              {view === "graph" && (
                <ClusterGraph activeTopics={activeTopics} onNodeHover={setTooltip} />
              )}
              <span className="graph-hint">scroll to zoom · drag to pan · click legend to filter</span>
            </div>

            <aside className="sidebar">
              <div className="sb-sec">
                <div className="sb-lbl">group by</div>
                <div className="group-opts">
                  {["primary topic", "all topics", "keywords"].map(opt => (
                    <div key={opt} className={`group-opt${groupBy === opt ? " active" : ""}`} onClick={() => setGroupBy(opt)}>
                      <span className="mini-dot" />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div className="sb-sec" style={{ paddingBottom: 8 }}>
                <div className="sb-lbl">topics · {PAPERS.length} papers</div>
              </div>
              <div className="legend">
                {topicCounts.map(tc => {
                  const on = activeTopics === null || activeTopics.has(tc.id);
                  return (
                    <div key={tc.id} className={`leg-item${!on ? " dim" : ""}`} onClick={() => toggleTopic(tc.id)}>
                      <span className="leg-dot" style={{ background: tc.color }} />
                      <span className="leg-name">{tc.name}</span>
                      <span className="leg-count">{tc.count}</span>
                    </div>
                  );
                })}
                {activeTopics !== null && (
                  <div style={{ marginTop: 10 }}>
                    <button className="btn full" onClick={() => setActiveTopics(null)}>show all</button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* ── TOOLTIP ───────────────────────────── */}
        {tooltip && (
          <div className="tip" style={{
            left: Math.min(tooltip.x + 14, window.innerWidth - 285),
            top: Math.min(tooltip.y - 10, window.innerHeight - 130),
          }}>
            <div className="tip-title">{tooltip.paper.t}</div>
            <div className="tip-topic">
              <span className="tip-dot" style={{ background: TOPIC_COLORS[tooltip.paper.p] }} />
              {TOPIC_NAMES[tooltip.paper.p]}
            </div>
            <div className="tip-kw">{tooltip.paper.k}</div>
          </div>
        )}
      </div>
    </>
  );
}
