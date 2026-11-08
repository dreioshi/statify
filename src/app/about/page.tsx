import { BarChart3, BookOpen, Database, FlaskConical } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DeveloperPhoto from "@/components/about/DeveloperPhoto";

const developer = {
  name: "Drei Matthew B. Laya",
  role: "Developer & Designer · BSIT-3B",
  photo: "/developer.jpg",
  bio: "Drei Matthew B. Laya is a 3rd year BSIT student from BSIT-3B who built Statify as his individual final project for Advanced Statistics (ADVSTAT). He designed and developed the whole workspace to turn the Module 7 and Module 9 lessons into something students can try step by step.",
  focus: ["Simple linear regression", "Hypothesis testing", "Web development"],
};

const features = [
  { icon: BarChart3, title: "Regression & Correlation", text: "Fitted line, Pearson r, r², residuals, and a scatter diagram with plain-language interpretation.", tag: "Module 7" },
  { icon: FlaskConical, title: "Hypothesis Testing", text: "One- and two-sample Z-tests with critical regions, a normal curve, and a built-in Z-table.", tag: "Module 9" },
  { icon: Database, title: "Analysis History", text: "Signed-in users have every analysis saved to their account to review, rename, or delete.", tag: "Account" },
  { icon: BookOpen, title: "Study Guide", text: "Short reviews of the key concepts and formulas from Modules 7 and 9.", tag: "Learn" },
];

const stack = ["Next.js", "React", "TypeScript", "Tailwind", "Supabase", "Recharts"];

export default function About() {
  return (
    <>
      <PageHeader title="About Statify" description="The purpose, scope, and technology behind this project." />

      <section className="panel dev-card">
        <DeveloperPhoto src={developer.photo} name={developer.name} />
        <div className="dev-info">
          <span className="module-tag">Meet the developer</span>
          <h2>{developer.name}</h2>
          <p className="dev-role">{developer.role}</p>
          <p className="dev-bio">{developer.bio}</p>
          <div className="chip-row">
            {developer.focus.map(f => <span className="chip" key={f}>{f}</span>)}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><h2>What is Statify?</h2><p className="brand-tagline">From Data to Statistical Insight.</p></div>
          <span className="module-tag violet-tag">Advanced Statistics Analysis Studio</span>
        </div>
        <p className="about-text">Statify is an educational web application designed to help students perform and understand selected statistical analyses through an interactive interface. It focuses on the course topics of Simple Linear Regression and Correlation (Module 7) and Hypothesis Testing (Module 9).</p>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text, tag }) => (
            <article className="feature-card" key={title}>
              <span className="quick-icon lime"><Icon /></span>
              <div><b>{title}</b><p>{text}</p><small>{tag}</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><h2>Project details</h2></div>
        <div className="about-facts">
          <div><small>Course</small><b>Advanced Statistics (ADVSTAT)</b></div>
          <div><small>Academic scope</small><b>Modules 7 and 9</b></div>
          <div><small>Project type</small><b>Individual final project</b></div>
          <div><small>Technology</small><div className="chip-row">{stack.map(t => <span className="chip" key={t}>{t}</span>)}</div></div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><h2>Scope and limitations</h2></div>
        <p className="about-text">The project provides simple linear regression and correlation calculations, and Z-test workflows aligned with the final output requirements. Module 9 also discusses T-tests; their detailed degrees-of-freedom and critical-value procedures require verification before calculator implementation. Signed-in users&rsquo; analyses are saved automatically to their Statify account; guests can calculate, but results are not saved.</p>
      </section>
    </>
  );
}