import { useState, useEffect, useRef, useCallback } from "react";
import G6 from "@antv/g6";

/* ─── Color palette for dynamic topic assignment ────────────── */
const PALETTE = [
  "#8c8fae","#584563","#9a6348","#c0c741",
  "#e4943a","#d26471","#34859d","#70377f",
  "#6b8e6b","#c98b5e","#5e8ec9","#c95e8e",
  "#8ec95e","#5ec9c9","#c9a45e","#7f5870",
];

/* ─── Demo dataset (hardcoded) ──────────────────────────────── */
const DEMO_TOPIC_COLORS = {
  0:"#8c8fae",1:"#584563",2:"#9a6348",3:"#c0c741",
  4:"#e4943a",5:"#d26471",6:"#34859d",7:"#70377f",
};
const DEMO_TOPIC_NAMES = {
  0:"pedagogical agent design",
  1:"teachable agents & learning-by-teaching",
  2:"scaffolding & instructional support",
  3:"mathematics learning",
  4:"student motivation & engagement",
  5:"social acceptance & interaction",
  6:"learning outcomes & transfer",
  7:"special populations & accessibility",
};
const DEMO_PAPERS = [{"id":0,"author":"Abdelghani et al. (2022)","year":"2022","t":"Conversational agents for fostering curiosity-driven learning in children","p":4,"a":[2,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Primary","learnTopic":"Not Reported","media":"Not reported","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Conversational","agentForm":"Non-human","specialPop":"no"},{"id":1,"author":"Adair et al. (2023)","year":"2023","t":"Real-Time AI-Driven Assessment & Scaffolding That Improves Students' Mathematical Modeling during Science Inquiry","p":2,"a":[2,3,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Conference proceeding","grade":"Lower Secondary","learnTopic":"Science","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":2,"author":"Alaimi et al. (2020)","year":"2020","t":"Pedagogical agents for fostering question-asking skills in children","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Science","media":"Tablet","setting":"Lab","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Multiple roles","agentForm":"Non-human","specialPop":"no"},{"id":3,"author":"Ali et al. (2020)","year":"2020","t":"A Virtual Conversational Agent for Teens with Autism Spectrum Disorder","p":7,"a":[0,7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Conference proceeding","grade":"Unknown","learnTopic":"Social Skills","media":"Computer","setting":"Lab","studyType":"Mixed methods","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Human-inspired","specialPop":"autistic"},{"id":4,"author":"Aljameel (2018)","year":"2018","t":"Development of an Arabic conversational intelligent tutoring system for children with ASD","p":7,"a":[7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Dissertation","grade":"Unknown","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"autistic + non-autistic"},{"id":5,"author":"Andre et al. (2014)","year":"2014","t":"Ethorobotics applied to human behaviour: can animated objects influence children?","p":0,"a":[0,5],"k":"agent design; realism; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Primary","learnTopic":"Mathematics","media":"Other","setting":"Lab","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Not Reported","agentForm":"Human-inspired","specialPop":"no"},{"id":6,"author":"Arguedas & Daradoumis (2021)","year":"2021","t":"Analysing the role of a pedagogical agent in psychological preparatory activities","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Computer Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":7,"author":"Barker (2003)","year":"2003","t":"Collaborative learning with affective artificial study companions in a VLE","p":5,"a":[4,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Dissertation","grade":"Unknown","learnTopic":"Not Reported","media":"Not reported","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Non-human","specialPop":"no"},{"id":8,"author":"Beege et al. (2020)","year":"2020","t":"Does the effect of enthusiasm in a pedagogical agent's voice depend on mental load?","p":0,"a":[0,2],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Tablet","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":9,"author":"Beilharz et al. (2021)","year":"2021","t":"Development of a Positive Body Image Chatbot (KIT) With Young People","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Unknown","learnTopic":"Science","media":"Not reported","setting":"Classroom","studyType":"Qualitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Non-human","specialPop":"body image/eating disorders"},{"id":10,"author":"Bringula et al. (2018)","year":"2018","t":"Effects of pedagogical agents on students' mathematics performance","p":0,"a":[0,3,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Computer","setting":"Not reported","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":11,"author":"Cabada et al. (2017)","year":"2017","t":"Knowledge-Based System in an Affective and Intelligent Tutoring System","p":3,"a":[3,4,2],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving","pubType":"Other","grade":"Primary","learnTopic":"Mathematics","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":12,"author":"Carpenter (2013)","year":"2013","t":"Strategy instruction in early childhood math software","p":3,"a":[3,0],"k":"mathematics; math learning; strategy instruction; arithmetic; problem-solving","pubType":"Dissertation","grade":"Primary","learnTopic":"Mathematics","media":"Computer","setting":"Lab","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":13,"author":"Chang et al. (2023)","year":"2023","t":"Designing situated learning experiences for smart cities","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Journal article","grade":"Primary","learnTopic":"Mathematics","media":"Tablet","setting":"Lab","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":14,"author":"Chen & Chan (2008)","year":"2008","t":"Learning by Substitutive Competition: Nurturing My-Pet for Game Competition","p":1,"a":[1],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Not Reported","agentForm":"Non-human","specialPop":"no"},{"id":15,"author":"Chen & Chen (2014)","year":"2014","t":"When educational agents meet surrogate competition","p":4,"a":[4,0],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Primary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Not Reported","agentForm":"Non-human","specialPop":"no"},{"id":16,"author":"Chen & Chou (2015)","year":"2015","t":"Enhancing middle school students' scientific learning and motivation through agent-based learning","p":4,"a":[4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":17,"author":"Crossley et al. (2018)","year":"2018","t":"Modeling Math Identity and Math Success through Sentiment Analysis","p":4,"a":[3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Mathematics","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":18,"author":"Daradoumis & Arguedas (2020)","year":"2020","t":"Cultivating students' reflective learning in metacognitive activities","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Computer Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":19,"author":"Davis & Antonenko (2017)","year":"2017","t":"Effects of Pedagogical Agent Gestures on Social Acceptance and Learning","p":0,"a":[0,5,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Primary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":20,"author":"Dincer & Doganay (2015)","year":"2015","t":"The impact of pedagogical agent on learners' motivation and academic success","p":4,"a":[4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Computer Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Mixed - multiple agents","specialPop":"no"},{"id":21,"author":"Dincer & Doganay (2017)","year":"2017","t":"The effects of multiple-pedagogical agents on learners' academic success, motivation, and cognitive load","p":0,"a":[0,4,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Primary","learnTopic":"Computer Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Mixed - multiple agents","specialPop":"no"},{"id":22,"author":"Ericsson et al. (2023)","year":"2023","t":"From deadpan machine to relating socially: Middle school students' experiences with ECAs","p":5,"a":[0,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Feasability/Usability/Perception","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"no"},{"id":23,"author":"Genova et al. (2021)","year":"2021","t":"A pilot RCT of virtual reality job interview training in transition-age youth on the autism spectrum","p":7,"a":[7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Job Skills","media":"Virtual reality","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"autistic"},{"id":24,"author":"Grynszpan et al. (2022)","year":"2022","t":"Social gaze training for Autism Spectrum Disorder using eye-tracking and virtual humans","p":7,"a":[7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Journal article","grade":"Unknown","learnTopic":"Social Skills","media":"Computer","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"asd"},{"id":25,"author":"Haake & Gulz (2009)","year":"2009","t":"A look at the roles of look & roles in embodied pedagogical agents","p":0,"a":[0,5],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Mix Lower Secondary - Upper Secondary","learnTopic":"Job Skills","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Mixed - multiple agents","specialPop":"no"},{"id":26,"author":"Haug et al. (2023)","year":"2023","t":"Mobile App-Based Coaching for Alcohol Prevention among Adolescents","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Science","media":"Phone","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Human-inspired","specialPop":"no"},{"id":27,"author":"Holmes (2007)","year":"2007","t":"Designing agents to support learning by explaining","p":1,"a":[1,0],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Journal article","grade":"Primary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"no"},{"id":28,"author":"Huang et al. (2022)","year":"2022","t":"Exploring acceptance of intelligent tutoring system with pedagogical agent","p":5,"a":[0,3,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Mathematics","media":"Phone","setting":"On their own time","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":29,"author":"Jaques et al. (2009)","year":"2009","t":"Evaluating the affective tactics of an emotional pedagogical agent","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Conference proceeding","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":30,"author":"Jeon (2022)","year":"2022","t":"Exploring a self-directed interactive app for informal EFL learning","p":4,"a":[4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Primary","learnTopic":"Language","media":"Phone","setting":"On their own time","studyType":"Mixed methods","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Non-human","specialPop":"no"},{"id":31,"author":"Jing et al. (2022)","year":"2022","t":"Pedagogical agents in learning videos: which one is best for children?","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Primary","learnTopic":"Science","media":"Computer","setting":"Lab","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":32,"author":"Johnson et al. (2013)","year":"2013","t":"Pedagogical agent signaling of multiple visual engineering representations","p":0,"a":[0,2,3],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":33,"author":"Kautzmann & Jaques (2019)","year":"2019","t":"Effects of adaptive training on metacognitive knowledge monitoring ability","p":2,"a":[2,3],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":34,"author":"Kim (2009)","year":"2009","t":"The role of learner attributes and affect determining the impact of agent presence","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":35,"author":"Kim et al. (2017)","year":"2017","t":"An embodied agent helps anxious students in mathematics learning","p":4,"a":[0,3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":36,"author":"Kim et al. (2007)","year":"2007","t":"Mathgirls: toward developing girls' positive attitude and self-efficacy","p":4,"a":[4,3,0],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Other","grade":"Upper Secondary","learnTopic":"Mathematics","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":37,"author":"Kizilkaya & Askar (2008)","year":"2008","t":"The effect of an embedded pedagogical agent on the students' science achievement","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Primary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Motivational","agentForm":"Non-human","specialPop":"no"},{"id":38,"author":"Korhonen et al. (2018)","year":"2018","t":"High Support Need and Minimally Verbal Children with Autism Playing a Computer Game","p":7,"a":[7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Journal article","grade":"Primary","learnTopic":"Social Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"autistic"},{"id":39,"author":"Kowatsch et al. (2021)","year":"2021","t":"Conversational agents as mediating social actors in chronic disease management","p":5,"a":[5],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Journal article","grade":"Unknown","learnTopic":"Science","media":"Phone","setting":"On their own time","studyType":"Mixed methods","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Human-inspired","specialPop":"Asthma"},{"id":40,"author":"Law et al. (2020)","year":"2020","t":"Curiosity Notebook: A Platform for Learning by Teaching Conversational Agents","p":1,"a":[1],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Qualitative","studyPurpose":"Experiment","agentType":"Conversational","agentForm":"Non-human","specialPop":"no"},{"id":41,"author":"Lazo et al. (2018)","year":"2018","t":"Classification of Public Elementary Students' Game Play Patterns","p":6,"a":[0,6],"k":"learning outcomes; knowledge acquisition; retention; transfer; academic achievement","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":42,"author":"Lester et al. (1997)","year":"1997","t":"Animated pedagogical agents and problem-solving effectiveness","p":6,"a":[0,6],"k":"learning outcomes; knowledge acquisition; retention; transfer; academic achievement","pubType":"Conference proceeding","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":43,"author":"Li et al. (2019)","year":"2019","t":"Testing the Robustness of Inquiry Practices Once Scaffolding Is Removed","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Science","media":"Not reported","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":44,"author":"Makransky et al. (2018)","year":"2018","t":"A gender matching effect in learning with pedagogical agents in VR","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Virtual reality","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":45,"author":"Mei (2016)","year":"2016","t":"Improving virtual reality ASD intervention games with 3D virtual humans","p":7,"a":[0,7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Dissertation","grade":"Unknown","learnTopic":"Social Skills","media":"Computer","setting":"Lab","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"autistic"},{"id":46,"author":"Meij et al. (2015)","year":"2015","t":"Animated pedagogical agents effects on enhancing student motivation and learning","p":4,"a":[0,4,6],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Motivational","agentForm":"Human-inspired","specialPop":"no"},{"id":47,"author":"Mohammadhasani et al. (2018)","year":"2018","t":"The pedagogical agent enhances mathematics learning in ADHD students","p":7,"a":[3,7],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Journal article","grade":"Primary","learnTopic":"Mathematics","media":"Computer","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"adhd"},{"id":48,"author":"Molenaar et al. (2012)","year":"2012","t":"Dynamic scaffolding of socially regulated learning in a computer-based learning environment","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Journal article","grade":"Primary","learnTopic":"Social Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":49,"author":"Moreno et al. (2001)","year":"2001","t":"The case for social agency in computer-based teaching","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":50,"author":"Murray & Tenenbaum (2010)","year":"2010","t":"Computerized pedagogical agents as an educational means for developing physical self-efficacy","p":4,"a":[0,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Mix Primary - Lower Secondary","learnTopic":"Science","media":"Not reported","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Human-inspired","specialPop":"no"},{"id":51,"author":"Nguyen (2022)","year":"2022","t":"Let's teach kibot: discovering discussion patterns between student groups","p":1,"a":[1,5],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Non-human","specialPop":"no"},{"id":52,"author":"Nielen et al. (2017)","year":"2017","t":"Digital guidance for susceptible readers: effects on fifth graders' reading motivation","p":7,"a":[7,4],"k":"autism; ADHD; special needs; accessibility; individual differences","pubType":"Journal article","grade":"Primary","learnTopic":"Reading","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Motivational","agentForm":"Non-human","specialPop":"no"},{"id":53,"author":"Okita (2014)","year":"2014","t":"Learning from the folly of others: Learning to self-correct","p":1,"a":[1,3],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Journal article","grade":"Primary","learnTopic":"Mathematics","media":"Computer","setting":"Lab","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":54,"author":"Ozogul et al. (2013)","year":"2013","t":"Investigating the impact of pedagogical agent gender matching and learner choice","p":0,"a":[0],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Mix Primary - Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":55,"author":"Pérez-Marín & Pascual-Nieto (2013)","year":"2013","t":"An exploratory study on how children interact with pedagogic conversational agents","p":5,"a":[5,0],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Journal article","grade":"Unknown","learnTopic":"Reading","media":"Computer","setting":"Classroom","studyType":"Qualitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Mixed - multiple agents","specialPop":"no"},{"id":56,"author":"Petersen et al. (2022)","year":"2022","t":"Pipetting in virtual reality can predict real-life pipetting performance","p":0,"a":[0,4],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Science","media":"Virtual reality","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":57,"author":"Plant et al. (2009)","year":"2009","t":"Changing middle-school students' attitudes regarding engineering","p":4,"a":[0,4,3],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":58,"author":"Sahimi et al. (2010)","year":"2010","t":"The pedagogical agent in online learning: effects of the degree of realism","p":0,"a":[0,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Upper Secondary","learnTopic":"Science","media":"Computer","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":59,"author":"Sao Pedro et al. (2014)","year":"2014","t":"The impacts of automatic scaffolding on students' acquisition of inquiry skills","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Conference proceeding","grade":"Lower Secondary","learnTopic":"Science","media":"Not reported","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":60,"author":"Sinoo et al. (2018)","year":"2018","t":"Friendship with a robot: Children's perception of similarity","p":5,"a":[0,5],"k":"social acceptance; human-likeness; agent personality; interaction patterns","pubType":"Journal article","grade":"Unknown","learnTopic":"Science","media":"Tablet","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Conversational","agentForm":"Non-human","specialPop":"diabetic"},{"id":61,"author":"Tärning & Silvervarg (2019)","year":"2019","t":"How design of a digital tutee's self-efficacy affects conversation and behavior","p":1,"a":[1,4],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Journal article","grade":"Primary","learnTopic":"Mathematics","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Multiple roles","agentForm":"Non-human","specialPop":"no"},{"id":62,"author":"Tegos et al. (2016)","year":"2016","t":"An Investigation of Conversational Agent Interventions Supporting Historical Reasoning","p":2,"a":[2,5],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Social Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Feasability/Usability/Perception","agentType":"Conversational","agentForm":"Non-human","specialPop":"no"},{"id":63,"author":"Wei (2010)","year":"2010","t":"The effects of pedagogical agents on mathematics anxiety and mathematics learning","p":4,"a":[3,4],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Dissertation","grade":"Lower Secondary","learnTopic":"Mathematics","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":64,"author":"Wiggins (2021)","year":"2021","t":"Examining dialogue initiative policies for conversational pedagogical agents","p":2,"a":[0,2],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Dissertation","grade":"Lower Secondary","learnTopic":"Science","media":"Phone","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Conversational","agentForm":"Human-inspired","specialPop":"no"},{"id":65,"author":"Woolf et al. (2010)","year":"2010","t":"The Effect of Motivational Learning Companions on Low Achieving Students and Students with Disabilities","p":4,"a":[4,7],"k":"motivation; self-efficacy; engagement; emotional support; learning attitudes","pubType":"Conference proceeding","grade":"Mix Lower Secondary - Upper Secondary","learnTopic":"Mathematics","media":"Not reported","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"Learning Disability"},{"id":66,"author":"Xu (2009)","year":"2009","t":"An investigation of the effectiveness of intelligent elaborative feedback by pedagogical agents","p":2,"a":[2,0,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Dissertation","grade":"Mix Primary - Lower Secondary","learnTopic":"Language","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":67,"author":"Yalçın et al. (2022)","year":"2022","t":"An intelligent pedagogical agent to foster computational thinking","p":2,"a":[2,6],"k":"scaffolding; dynamic support; hints; guidance; adaptive agents; intelligent tutoring","pubType":"Conference proceeding","grade":"Primary","learnTopic":"Social Skills","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"},{"id":68,"author":"Yılmaz & Kılıç-Çakmak (2012)","year":"2012","t":"Educational interface agents as social models to influence learner achievement","p":0,"a":[0,4,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Mixed methods","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Mixed - multiple agents","specialPop":"no"},{"id":69,"author":"Yung & Paas (2015)","year":"2015","t":"Effects of cueing by a pedagogical agent in an instructional animation","p":0,"a":[0,2,6],"k":"agent design; realism; gender matching; gestures; appearance; embodied agents","pubType":"Journal article","grade":"Lower Secondary","learnTopic":"Science","media":"Computer","setting":"Classroom","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Human-inspired","specialPop":"no"},{"id":70,"author":"Zhao et al. (2012)","year":"2012","t":"Learning-by-Teaching: Designing Teachable Agents with Intrinsic Motivation","p":1,"a":[1,4],"k":"teachable agents; learning-by-teaching; protégé effect; agent self-efficacy","pubType":"Journal article","grade":"Primary","learnTopic":"Science","media":"Computer","setting":"Not reported","studyType":"Quantitative","studyPurpose":"Experiment","agentType":"Pedagogical","agentForm":"Non-human","specialPop":"no"}];
const DEMO_FILTER_KEYS = ["pubType","grade","learnTopic","media","setting","studyType","studyPurpose","agentType","agentForm","specialPop"];
const DEMO_FILTER_LABELS = {
  pubType:"publication type", grade:"grade level", learnTopic:"learning topic",
  media:"study media", setting:"study setting", studyType:"study type",
  studyPurpose:"study purpose", agentType:"agent type", agentForm:"agent form",
  specialPop:"special population",
};

/* ─── CSV parser (no dependency, handles quoted fields) ─────── */
function parseCSVText(text) {
  const rows = [];
  let row = [], field = '', inQuote = false;
  const flush = () => { row.push(field); field = ''; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else field += ch;
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { flush(); }
      else if (ch === '\r' && next === '\n') { flush(); if (row.some(Boolean)) rows.push(row); row = []; i++; }
      else if (ch === '\n') { flush(); if (row.some(Boolean)) rows.push(row); row = []; }
      else field += ch;
    }
  }
  flush();
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

/* ─── Main CSV → graph data converter ──────────────────────── */
// Convention:
//   col 0        = Author
//   col 1        = Year
//   col 2        = Title
//   col 3        = Abstract     (shown in tooltip, not filtered)
//   col 4..N-6   = filter columns (auto-detected, any number)
//   col N-4      = Primary Topic (integer)
//   col N-3      = Primary Topic Name
//   col N-2      = All Topics (comma/semicolon separated integers)
//   col N-1      = All Topic Names
//   col N        = Keywords
function parseUploadedCSV(text) {
  const raw = parseCSVText(text);
  if (raw.length < 2) throw new Error('CSV needs at least a header row and one data row.');
  const headers = raw[0].map(h => h.trim());
  if (headers.length < 6) throw new Error('CSV needs at least 6 columns (4 metadata + 0 filters + last 5 cluster columns). Got ' + headers.length + '.');

  const dataRows = raw.slice(1);
  const N = headers.length - 1;
  // Last 5 cluster column indices: N-4, N-3, N-2, N-1, N
  const filterHeaders = headers.slice(4, N - 4); // middle columns

  const topicNameMap = {};
  const papers = dataRows.map((cells, i) => {
    // pad short rows
    while (cells.length <= N) cells.push('');
    const primaryTopic = parseInt(cells[N - 4]) || 0;
    const primaryTopicName = cells[N - 3]?.trim() || `Topic ${primaryTopic}`;
    const allTopicsRaw = cells[N - 2]?.trim().replace(/[\[\]]/g, '') || String(primaryTopic);
    const allTopics = allTopicsRaw.split(/[,;]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const keywords = cells[N]?.trim() || '';
    if (!topicNameMap[primaryTopic]) topicNameMap[primaryTopic] = primaryTopicName;
    const paper = {
      id: i,
      author: cells[0]?.trim() || '',
      year:   cells[1]?.trim() || '',
      t:      cells[2]?.trim() || `Paper ${i + 1}`,
      abstract: cells[3]?.trim() || '',
      p: primaryTopic,
      a: allTopics.length ? allTopics : [primaryTopic],
      k: keywords,
    };
    filterHeaders.forEach((h, j) => { paper[h] = cells[4 + j]?.trim() || ''; });
    return paper;
  }).filter(p => p.t); // drop truly empty rows

  if (!papers.length) throw new Error('No valid data rows found in CSV.');

  // Build filterDefs — unique sorted values per middle column
  const filterDefs = filterHeaders.map(h => ({
    key: h,
    label: h.toLowerCase(),
    values: [...new Set(papers.map(p => p[h]).filter(Boolean))].sort(),
  })).filter(fd => fd.values.length > 0); // skip columns with no data

  // Assign topic colors + names
  const topicIds = [...new Set(papers.map(p => p.p))].sort((a, b) => a - b);
  const topicColors = {}, topicNames = {};
  topicIds.forEach((id, i) => {
    topicColors[id] = PALETTE[i % PALETTE.length];
    topicNames[id] = topicNameMap[id] || `Topic ${id}`;
  });

  return { papers, filterDefs, topicColors, topicNames };
}

/* ─── Build demo filterDefs from hardcoded keys ─────────────── */
function buildDemoFilterDefs() {
  return DEMO_FILTER_KEYS.map(key => ({
    key,
    label: DEMO_FILTER_LABELS[key] || key,
    values: [...new Set(DEMO_PAPERS.map(p => p[key]).filter(Boolean))].sort(),
  }));
}

/* ─── Filter logic ─────────────────────────────────────────── */
function paperPasses(paper, activeTopics, attrFilters) {
  if (activeTopics !== null && !activeTopics.has(paper.p)) return false;
  for (const { key } of (attrFilters._defs || [])) {
    const fs = attrFilters[key];
    if (fs && fs.size > 0) {
      const v = (paper[key] || '').toLowerCase().trim();
      if (![...fs].some(f => f.toLowerCase().trim() === v)) return false;
    }
  }
  return true;
}

/* ─── Graph helpers ─────────────────────────────────────────── */
function getClusterCenters(W, H, topicIds) {
  const centers = {};
  topicIds.forEach((g, i) => {
    const angle = (i / topicIds.length) * 2 * Math.PI - Math.PI / 2;
    const r = Math.min(W, H) * 0.3;
    centers[g] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
  });
  return centers;
}

function buildSparseEdges(papers) {
  const byGroup = {};
  papers.forEach(p => { (byGroup[p.p] = byGroup[p.p] || []).push(p.id); });
  const edgeSet = new Set(), edges = [];
  const addEdge = (a, b) => {
    const key = [a, b].sort((x, y) => x - y).join('-');
    if (!edgeSet.has(key)) { edgeSet.add(key); edges.push({ id: `e-${key}`, source: `n${a}`, target: `n${b}` }); }
  };
  Object.values(byGroup).forEach(ids => {
    if (ids.length < 2) return;
    const s = [...ids].sort(() => Math.random() - 0.5);
    for (let i = 0; i < s.length - 1; i++) addEdge(s[i], s[i + 1]);
    ids.forEach(id => {
      const others = ids.filter(x => x !== id);
      if (others.length) addEdge(id, others[Math.floor(Math.random() * others.length)]);
    });
  });
  return edges;
}

/* ─── Ambient canvas background ─────────────────────────────── */
function AmbientGraph({ topicColors }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const colors = Object.values(topicColors);
    const pts = Array.from({ length: 52 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: 2 + Math.random() * 5.5, color: colors[i % colors.length],
    }));
    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 115) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(31,14,28,${0.05 * (1 - d / 115)})`; ctx.lineWidth = 0.65; ctx.stroke();
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '2b'; ctx.fill();
        ctx.strokeStyle = p.color + '3e'; ctx.lineWidth = 1; ctx.stroke();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10 || p.x > W + 10) p.vx *= -1;
        if (p.y < -10 || p.y > H + 10) p.vy *= -1;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ─── Cluster graph ─────────────────────────────────────────── */
function ClusterGraph({ papers, topicColors, activeTopics, attrFilters, filterDefs, onNodeHover }) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const papersByIdRef = useRef({});

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const topicIds = [...new Set(papers.map(p => p.p))].sort((a, b) => a - b);
    const centers = getClusterCenters(W, H, topicIds);
    const papersById = Object.fromEntries(papers.map(p => [p.id, p]));
    papersByIdRef.current = papersById;
    const edges = buildSparseEdges(papers);

    const nodes = papers.map(p => ({
      id: `n${p.id}`,
      x: centers[p.p].x + (Math.random() - 0.5) * 40,
      y: centers[p.p].y + (Math.random() - 0.5) * 40,
      size: 14,
      _paperId: p.id,
      _topic: p.p,
      style: { fill: topicColors[p.p] || '#999', stroke: 'rgba(31,14,28,0.2)', lineWidth: 0.7, cursor: 'pointer' },
    }));

    const graph = new G6.Graph({
      container: el, width: W, height: H, fitView: false,
      layout: {
        type: 'force', linkDistance: 30, nodeStrength: -18, edgeStrength: 0.55,
        preventOverlap: true, nodeSize: 14, damping: 0.97, alpha: 0.08,
        alphaDecay: 0.01, alphaMin: 0.001, clustering: false,
        onTick: () => {
          graph.getNodes().forEach(node => {
            const m = node.getModel(), c = centers[m._topic]; if (!c) return;
            const item = node.get('layoutItemData') || {};
            if (item) {
              item.vx = (item.vx || 0) + (c.x - (m.x || c.x)) * 0.055;
              item.vy = (item.vy || 0) + (c.y - (m.y || c.y)) * 0.055;
            }
          });
        },
      },
      defaultEdge: { style: { stroke: '#1f0e1c', lineWidth: 0.75, opacity: 0.1 } },
      nodeStateStyles: { hover: { lineWidth: 2, stroke: 'rgba(31,14,28,0.7)', shadowColor: 'rgba(31,14,28,0.15)', shadowBlur: 8 } },
      modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
    });
    graph.data({ nodes, edges });
    graph.render();

    graph.on('node:mouseenter', evt => {
      graph.setItemState(evt.item, 'hover', true);
      const m = evt.item.getModel(), paper = papersByIdRef.current[m._paperId];
      const oe = evt.originalEvent || evt;
      onNodeHover({ paper, x: oe.clientX, y: oe.clientY });
    });
    graph.on('node:mousemove', evt => {
      const m = evt.item.getModel(), paper = papersByIdRef.current[m._paperId];
      const oe = evt.originalEvent || evt;
      onNodeHover({ paper, x: oe.clientX, y: oe.clientY });
    });
    graph.on('node:mouseleave', evt => {
      graph.setItemState(evt.item, 'hover', false);
      onNodeHover(null);
    });
    graph.on('node:dragend', evt => {
      graph.updateItem(evt.item, { fx: null, fy: null });
      const sim = graph.get('layoutController')?.layoutMethods?.[0]?.simulation;
      if (sim) sim.alpha(0.15).restart();
    });
    graphRef.current = graph;
    return () => { try { graphRef.current?.destroy(); } catch (_) {} graphRef.current = null; };
  }, [papers, topicColors]);

  useEffect(() => {
    const graph = graphRef.current; if (!graph) return;
    const papersById = papersByIdRef.current;
    graph.getNodes().forEach(node => {
      const m = node.getModel(), paper = papersById[m._paperId];
      const active = paperPasses(paper, activeTopics, attrFilters);
      graph.updateItem(node, { style: { fill: topicColors[m._topic] || '#999', stroke: 'rgba(31,14,28,0.2)', lineWidth: active ? 0.7 : 0.5, opacity: active ? 1 : 0.055 } });
    });
    graph.getEdges().forEach(edge => {
      const src = edge.getSource().getModel(), paper = papersById[src._paperId];
      const active = paperPasses(paper, activeTopics, attrFilters);
      graph.updateItem(edge, { style: { stroke: '#1f0e1c', lineWidth: 0.75, opacity: active ? 0.1 : 0.012 } });
    });
  }, [activeTopics, attrFilters, topicColors]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* ─── Filter accordion section ──────────────────────────────── */
function FilterSection({ def, attrFilters, onToggle, open, onOpenToggle }) {
  const activeSet = attrFilters[def.key];
  const activeCount = activeSet?.size || 0;
  return (
    <div className="fs-wrap">
      <div className="fs-head" onClick={onOpenToggle}>
        <span className="fs-label">{def.label}</span>
        {activeCount > 0 && <span className="fs-badge">{activeCount}</span>}
        <span className="fs-arrow">{open ? '▴' : '▾'}</span>
      </div>
      {open && (
        <div className="fs-chips">
          {def.values.map(v => (
            <button key={v} className={`chip${activeSet?.has(v) ? ' on' : ''}`} onClick={() => onToggle(def.key, v)}>
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Drop zone overlay ─────────────────────────────────────── */
function DropZone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const onDragOver = useCallback(e => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);
  if (!dragging) return null;
  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      style={{ position: 'fixed', inset: 0, background: 'rgba(31,14,28,0.12)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: '#f5edba', border: '2px dashed rgba(31,14,28,0.4)', borderRadius: 6,
        padding: '40px 60px', textAlign: 'center', fontFamily: "'Rethink Sans', sans-serif" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>drop csv here</div>
        <div style={{ fontSize: 12, opacity: 0.45 }}>col 1–4: metadata · middle: filters · last 5: clusters</div>
      </div>
    </div>
  );
}

/* ─── Root ──────────────────────────────────────────────────── */
export default function Nodum() {
  const [view, setView]           = useState('home');
  const [animating, setAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Graph data (null until loaded)
  const [papers, setPapers]           = useState(null);
  const [filterDefs, setFilterDefs]   = useState(null);
  const [topicColors, setTopicColors] = useState(DEMO_TOPIC_COLORS);
  const [topicNames, setTopicNames]   = useState(DEMO_TOPIC_NAMES);
  const [fileName, setFileName]       = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Sidebar state
  const [groupBy, setGroupBy]       = useState('primary topic');
  const [activeTopics, setActiveTopics] = useState(null);
  const [attrFilters, setAttrFilters]   = useState({});
  const [openFilters, setOpenFilters]   = useState(new Set());
  const [tooltip, setTooltip]           = useState(null);

  const fileInputRef = useRef(null);

  /* ── Helpers ── */
  const emptyAttrFilters = (defs) => {
    const f = { _defs: defs };
    defs.forEach(d => { f[d.key] = new Set(); });
    return f;
  };

  const loadData = useCallback((parsedPapers, parsedFilterDefs, parsedColors, parsedNames) => {
    setPapers(parsedPapers);
    setFilterDefs(parsedFilterDefs);
    setTopicColors(parsedColors);
    setTopicNames(parsedNames);
    setAttrFilters(emptyAttrFilters(parsedFilterDefs));
    setActiveTopics(null);
    setOpenFilters(new Set());
  }, []);

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setUploadError('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const { papers: p, filterDefs: fd, topicColors: tc, topicNames: tn } = parseUploadedCSV(e.target.result);
        loadData(p, fd, tc, tn);
        setFileName(file.name);
        setUploadError(null);
        setAnimating(true);
        setTimeout(() => { setView('graph'); setAnimating(false); }, 600);
      } catch (err) {
        setUploadError(err.message);
      }
    };
    reader.readAsText(file);
  }, [loadData]);

  const handleFileInput = useCallback(e => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  }, [handleFile]);

  const goToDemo = useCallback(() => {
    const demoFilterDefs = buildDemoFilterDefs();
    loadData(DEMO_PAPERS, demoFilterDefs, DEMO_TOPIC_COLORS, DEMO_TOPIC_NAMES);
    setFileName(null);
    setAnimating(true);
    setTimeout(() => { setView('graph'); setAnimating(false); }, 600);
  }, [loadData]);

  const goHome = useCallback(() => {
    setView('home');
    setTooltip(null);
  }, []);

  /* ── Drag-drop on window ── */
  useEffect(() => {
    const over = e => { e.preventDefault(); setIsDragging(true); };
    const leave = e => { if (!e.relatedTarget) setIsDragging(false); };
    const drop = e => {
      e.preventDefault(); setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    };
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('dragleave', leave); window.removeEventListener('drop', drop); };
  }, [handleFile]);

  /* ── Topic toggle ── */
  const toggleTopic = useCallback(id => setActiveTopics(prev => {
    if (prev === null) return new Set([id]);
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id);
    return s.size === 0 ? null : s;
  }), []);

  /* ── Attr filter toggle ── */
  const toggleAttr = useCallback((key, val) => setAttrFilters(prev => {
    const next = { ...prev, [key]: new Set(prev[key]) };
    next[key].has(val) ? next[key].delete(val) : next[key].add(val);
    return next;
  }), []);

  const clearAll = useCallback(() => {
    setActiveTopics(null);
    setAttrFilters(emptyAttrFilters(filterDefs || []));
  }, [filterDefs]);

  const toggleOpenFilter = useCallback(key => setOpenFilters(prev => {
    const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key);
    return s;
  }), []);

  /* ── Derived ── */
  const topicIds = papers ? [...new Set(papers.map(p => p.p))].sort((a, b) => a - b) : [];
  const topicCounts = topicIds.map(id => ({
    id, name: topicNames[id] || `Topic ${id}`,
    count: papers ? papers.filter(p => p.p === id).length : 0,
    color: topicColors[id] || '#999',
  }));
  const matchCount = papers ? papers.filter(p => paperPasses(p, activeTopics, attrFilters)).length : 0;
  const hasAnyFilter = activeTopics !== null || (filterDefs || []).some(d => attrFilters[d.key]?.size > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#f5edba;height:100%;overflow:hidden;}
        .root{font-family:'Rethink Sans',sans-serif;letter-spacing:-0.02em;
          background:#f5edba;color:#1f0e1c;width:100vw;height:100vh;overflow:hidden;position:relative;}

        /* HOME */
        .home{position:absolute;inset:0;display:flex;flex-direction:column;
          justify-content:center;padding:0 9vw;
          transition:transform .6s cubic-bezier(.76,0,.24,1),opacity .6s cubic-bezier(.76,0,.24,1);
          z-index:2;overflow:hidden;}
        .home.exit{transform:translateY(-100%);opacity:0;}
        .home-content{position:relative;z-index:1;}
        .home-title{font-size:clamp(64px,10.5vw,152px);font-weight:800;
          letter-spacing:-0.055em;line-height:.87;text-transform:lowercase;color:#1f0e1c;}
        .home-tagline{margin-top:18px;font-size:clamp(13px,1.2vw,16px);
          font-weight:400;letter-spacing:-0.01em;color:#1f0e1c;opacity:.4;}
        .home-actions{margin-top:36px;display:flex;flex-direction:column;align-items:flex-start;gap:11px;}

        .btn{display:inline-flex;align-items:center;justify-content:center;
          font-family:'Rethink Sans',sans-serif;font-size:12px;font-weight:600;
          letter-spacing:-0.01em;text-transform:lowercase;color:#1f0e1c;
          border:1.5px solid rgba(31,14,28,.5);background:transparent;
          padding:10px 26px;cursor:pointer;border-radius:2px;
          transition:background .16s,color .16s,border-color .16s,opacity .16s;white-space:nowrap;}
        .btn:hover{background:#1f0e1c;color:#f5edba;border-color:#1f0e1c;}
        .btn.ghost{opacity:.5;font-size:11.5px;padding:8px 22px;}
        .btn.ghost:hover{opacity:1;}
        .btn.full{width:100%;font-size:11px;padding:7px 0;}

        .upload-hint{font-size:10.5px;opacity:.32;letter-spacing:-.005em;margin-top:4px;max-width:340px;line-height:1.5;}
        .upload-hint code{font-family:inherit;background:rgba(31,14,28,.07);padding:1px 5px;border-radius:2px;}
        .upload-error{margin-top:6px;font-size:11px;color:#c0392b;font-weight:600;max-width:340px;line-height:1.4;}

        /* DRAG OVERLAY */
        .drag-overlay{position:fixed;inset:0;background:rgba(31,14,28,.1);z-index:50;
          display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);pointer-events:none;}
        .drag-box{background:#f5edba;border:2px dashed rgba(31,14,28,.4);border-radius:6px;
          padding:40px 60px;text-align:center;}
        .drag-box-title{font-size:28px;font-weight:800;letter-spacing:-.04em;margin-bottom:8px;}
        .drag-box-sub{font-size:12px;opacity:.4;}

        /* GRAPH PAGE */
        .graph-page{position:absolute;inset:0;display:flex;flex-direction:column;
          opacity:0;transform:translateY(48px);
          transition:opacity .44s .14s ease,transform .44s .14s ease;
          pointer-events:none;z-index:1;}
        .graph-page.visible{opacity:1;transform:translateY(0);pointer-events:all;}

        /* NAV */
        .nav{height:46px;display:flex;align-items:center;justify-content:space-between;
          padding:0 28px;border-bottom:1px solid rgba(31,14,28,.12);background:#f5edba;flex-shrink:0;}
        .nav-logo{font-size:17px;font-weight:800;letter-spacing:-0.055em;text-transform:lowercase;}
        .nav-links{display:flex;gap:24px;list-style:none;align-items:center;}
        .nav-links li{font-size:11.5px;font-weight:500;letter-spacing:-0.01em;text-transform:lowercase;
          opacity:.45;cursor:pointer;transition:opacity .14s;}
        .nav-links li:hover{opacity:1;}
        .nav-links li.active{opacity:1;font-weight:700;}
        .nav-file{font-size:10.5px;opacity:.35;font-style:italic;}

        /* LAYOUT */
        .graph-main{flex:1;display:flex;overflow:hidden;}
        .graph-canvas{flex:1;position:relative;overflow:hidden;}
        .graph-hint{position:absolute;bottom:14px;left:16px;font-size:10px;opacity:.22;letter-spacing:.01em;pointer-events:none;}

        /* SIDEBAR */
        .sidebar{width:268px;flex-shrink:0;border-left:1px solid rgba(31,14,28,.1);
          background:rgba(245,237,186,.5);display:flex;flex-direction:column;overflow:hidden;}
        .sb-scroll{flex:1;overflow-y:auto;padding-bottom:18px;}
        .sb-scroll::-webkit-scrollbar{width:3px;}
        .sb-scroll::-webkit-scrollbar-thumb{background:rgba(31,14,28,.16);border-radius:2px;}
        .sb-sec{padding:16px 16px 0;}
        .sb-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.3;margin-bottom:10px;}
        .group-opts{display:flex;flex-direction:column;gap:2px;}
        .group-opt{font-size:11.5px;font-weight:500;letter-spacing:-0.01em;text-transform:lowercase;
          padding:7px 10px;cursor:pointer;border-radius:2px;transition:background .13s;
          display:flex;align-items:center;gap:8px;}
        .group-opt:hover{background:rgba(31,14,28,.06);}
        .group-opt.active{background:#1f0e1c;color:#f5edba;font-weight:700;}
        .mini-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5;flex-shrink:0;}
        .divider{height:1px;background:rgba(31,14,28,.09);margin:12px 16px;}

        /* LEGEND */
        .legend{padding:0 16px;}
        .leg-item{display:flex;align-items:center;gap:9px;padding:6px 5px;border-radius:3px;
          cursor:pointer;transition:background .12s,opacity .12s;}
        .leg-item:hover{background:rgba(31,14,28,.05);}
        .leg-item.dim{opacity:.22;}
        .leg-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;transition:transform .12s;}
        .leg-item:hover .leg-dot{transform:scale(1.35);}
        .leg-name{font-size:11px;font-weight:500;letter-spacing:-0.01em;text-transform:lowercase;flex:1;line-height:1.3;}
        .leg-count{font-size:10.5px;opacity:.35;font-weight:600;}

        /* FILTER PANEL */
        .sb-filter-header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px 6px;}
        .sb-filter-title{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.3;}
        .sb-filter-clear{font-size:10px;font-weight:600;text-transform:lowercase;color:#1f0e1c;
          opacity:.5;cursor:pointer;transition:opacity .12s;border:none;background:none;
          padding:0;font-family:inherit;letter-spacing:-0.01em;}
        .sb-filter-clear:hover{opacity:1;}
        .match-bar{padding:4px 16px 0;display:flex;align-items:center;gap:6px;}
        .match-count{font-size:11px;font-weight:700;}
        .match-of{font-size:10.5px;opacity:.4;}
        .no-filters{padding:10px 16px;font-size:11px;opacity:.35;font-style:italic;}

        /* FILTER SECTION */
        .fs-wrap{border-bottom:1px solid rgba(31,14,28,.06);}
        .fs-head{display:flex;align-items:center;gap:6px;padding:8px 16px;cursor:pointer;transition:background .12s;}
        .fs-head:hover{background:rgba(31,14,28,.04);}
        .fs-label{font-size:11px;font-weight:600;letter-spacing:-0.01em;text-transform:lowercase;flex:1;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fs-badge{font-size:9px;font-weight:700;background:#1f0e1c;color:#f5edba;
          border-radius:10px;padding:1px 6px;letter-spacing:0;flex-shrink:0;}
        .fs-arrow{font-size:8px;opacity:.35;flex-shrink:0;}
        .fs-chips{padding:4px 16px 10px;display:flex;flex-wrap:wrap;gap:5px;}
        .chip{font-size:10px;font-weight:500;letter-spacing:-0.01em;text-transform:lowercase;
          padding:3px 9px;border-radius:20px;border:1px solid rgba(31,14,28,.25);
          background:transparent;color:#1f0e1c;cursor:pointer;
          transition:background .12s,color .12s,border-color .12s;font-family:inherit;white-space:nowrap;}
        .chip:hover{background:rgba(31,14,28,.08);}
        .chip.on{background:#1f0e1c;color:#f5edba;border-color:#1f0e1c;}

        /* TOOLTIP */
        .tip{position:fixed;background:#1f0e1c;color:#f5edba;padding:12px 15px;border-radius:3px;
          max-width:290px;pointer-events:none;z-index:9999;font-family:'Rethink Sans',sans-serif;
          font-size:11.5px;letter-spacing:-0.01em;line-height:1.5;
          box-shadow:0 6px 26px rgba(31,14,28,.22);}
        .tip-title{font-weight:700;margin-bottom:4px;font-size:11.5px;line-height:1.4;}
        .tip-author{font-size:10px;opacity:.5;margin-bottom:5px;}
        .tip-topic{font-size:10.5px;opacity:.55;text-transform:lowercase;margin-bottom:5px;}
        .tip-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:middle;}
        .tip-divider{height:1px;background:rgba(245,237,186,.12);margin:6px 0;}
        .tip-row{font-size:10px;opacity:.45;margin-bottom:2px;line-height:1.4;}
        .tip-row b{opacity:1;font-weight:600;}
        .tip-kw{font-size:9.5px;opacity:.35;margin-top:5px;font-style:italic;line-height:1.4;}
      `}</style>

      <div className="root">

        {/* DRAG OVERLAY */}
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-box">
              <div className="drag-box-title">drop csv here</div>
              <div className="drag-box-sub">col 1–4: metadata · middle cols: auto filters · last 5: cluster data</div>
            </div>
          </div>
        )}

        {/* HOME */}
        {view !== 'graph' && (
          <div className={`home${animating ? ' exit' : ''}`}>
            <AmbientGraph topicColors={DEMO_TOPIC_COLORS} />
            <div className="home-content">
              <div className="home-title">nodum.</div>
              <div className="home-tagline">knowledge maps, made effortless.</div>
              <div className="home-actions">
                <button className="btn" onClick={() => fileInputRef.current?.click()}>upload csv</button>
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileInput} />
                <button className="btn ghost" onClick={goToDemo}>check out a demo</button>
                <div className="upload-hint">
                  expected format: <code>col 1–4</code> author, year, title, abstract
                  · <code>middle cols</code> any filter columns (auto-detected)
                  · <code>last 5</code> primary topic #, topic name, all topics, all topic names, keywords
                </div>
                {uploadError && <div className="upload-error">⚠ {uploadError}</div>}
              </div>
            </div>
          </div>
        )}

        {/* GRAPH PAGE */}
        <div className={`graph-page${view === 'graph' ? ' visible' : ''}`}>
          <nav className="nav">
            <span className="nav-logo">nodum.</span>
            <ul className="nav-links">
              <li onClick={goHome}>home</li>
              <li onClick={() => fileInputRef.current?.click()}>
                new mapping
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileInput} />
              </li>
              <li className="active">{fileName || 'demo'}</li>
              {fileName && <li className="nav-file">{papers?.length} papers</li>}
            </ul>
          </nav>

          <div className="graph-main">
            <div className="graph-canvas">
              {view === 'graph' && papers && (
                <ClusterGraph
                  papers={papers}
                  topicColors={topicColors}
                  activeTopics={activeTopics}
                  attrFilters={attrFilters}
                  filterDefs={filterDefs}
                  onNodeHover={setTooltip}
                />
              )}
              <span className="graph-hint">scroll to zoom · drag to pan · click legend to filter</span>
            </div>

            <aside className="sidebar">
              <div className="sb-scroll">

                {/* Group by */}
                <div className="sb-sec">
                  <div className="sb-lbl">group by</div>
                  <div className="group-opts">
                    {['primary topic', 'all topics', 'keywords'].map(opt => (
                      <div key={opt} className={`group-opt${groupBy === opt ? ' active' : ''}`} onClick={() => setGroupBy(opt)}>
                        <span className="mini-dot" />{opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider" />

                {/* Topics */}
                <div className="sb-sec" style={{ paddingBottom: 8 }}>
                  <div className="sb-lbl">topics · {papers?.length || 0} papers</div>
                </div>
                <div className="legend">
                  {topicCounts.map(tc => {
                    const on = activeTopics === null || activeTopics.has(tc.id);
                    return (
                      <div key={tc.id} className={`leg-item${!on ? ' dim' : ''}`} onClick={() => toggleTopic(tc.id)}>
                        <span className="leg-dot" style={{ background: tc.color }} />
                        <span className="leg-name">{tc.name}</span>
                        <span className="leg-count">{tc.count}</span>
                      </div>
                    );
                  })}
                  {activeTopics !== null && (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn full" onClick={() => setActiveTopics(null)}>show all topics</button>
                    </div>
                  )}
                </div>

                <div className="divider" />

                {/* Filters */}
                <div className="sb-filter-header">
                  <span className="sb-filter-title">filter by</span>
                  {hasAnyFilter && <button className="sb-filter-clear" onClick={clearAll}>clear all</button>}
                </div>

                {filterDefs && filterDefs.length > 0 ? (
                  <>
                    <div className="match-bar">
                      <span className="match-count">{matchCount}</span>
                      <span className="match-of">of {papers?.length || 0} papers</span>
                    </div>
                    <div style={{ height: 8 }} />
                    {filterDefs.map(def => (
                      <FilterSection
                        key={def.key}
                        def={def}
                        attrFilters={attrFilters}
                        onToggle={toggleAttr}
                        open={openFilters.has(def.key)}
                        onOpenToggle={() => toggleOpenFilter(def.key)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="no-filters">no filter columns detected in this csv</div>
                )}

              </div>
            </aside>
          </div>
        </div>

        {/* TOOLTIP */}
        {tooltip && (() => {
          const p = tooltip.paper;
          const filterEntries = (filterDefs || []).filter(d => p[d.key]).slice(0, 6);
          return (
            <div className="tip" style={{
              left: Math.min(tooltip.x + 14, window.innerWidth - 305),
              top:  Math.min(tooltip.y - 10, window.innerHeight - 200),
            }}>
              <div className="tip-title">{p.t}</div>
              {(p.author || p.year) && (
                <div className="tip-author">{[p.author, p.year].filter(Boolean).join(' · ')}</div>
              )}
              <div className="tip-topic">
                <span className="tip-dot" style={{ background: topicColors[p.p] || '#999' }} />
                {topicNames[p.p] || `Topic ${p.p}`}
              </div>
              {filterEntries.length > 0 && (
                <>
                  <div className="tip-divider" />
                  {filterEntries.map(d => (
                    <div className="tip-row" key={d.key}><b>{d.label}</b> · {p[d.key]}</div>
                  ))}
                </>
              )}
              {p.k && <div className="tip-kw">{p.k}</div>}
            </div>
          );
        })()}
      </div>
    </>
  );
}
