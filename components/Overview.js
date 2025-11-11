import styles from '../styles/Overview.module.css';

export default function Overview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Funding Intelligence — Overview</h2>
        <p className={styles.lede}>
          Excited to officially welcome Adeel to the Proof360 core team. He’ll be leading the new Funding Intelligence System — the upstream engine that powers every grant, rebate, and funding opportunity across both B2B and B2C.
        </p>

        <nav className={styles.quicknav} aria-label="Overview sections">
          <a href="#purpose">Purpose</a>
          <a href="#simple-terms">In simple terms</a>
          <a href="#adeel">Adeel (Upstream)</a>
          <a href="#shubham">Shubham (Activation)</a>
          <a href="#architect">Financing Architect</a>
          <a href="#flow">The Flow</a>
          <a href="#phases">12‑Week Plan</a>
          <a href="#why">Why it matters</a>
        </nav>

        <section id="purpose" className={styles.card}>
          <h3>Purpose of this Extension</h3>
          <p>
            This extension provides the content framework for the Funding Intelligence setup — describing the upstream data engine, roles, and phases. It is documentation-only content to populate the site; there is no implementation logic here.
          </p>
        </section>

        <section id="simple-terms" className={styles.callout}>
          <h4>In simple terms</h4>
          <ul>
            <li><strong>Adeel</strong> finds and structures the money.</li>
            <li><strong>Shubham</strong> activates and monetizes it.</li>
            <li><strong>Monetization & Financing Architect</strong> manages credit and payment systems (BNPL, trade credit, 0% financing).</li>
            <li><strong>Yinka</strong> oversees financial inflows, reimbursements, and ROI tracking.</li>
          </ul>
        </section>

        <section id="adeel" className={`${styles.card} ${styles.grid2}`}>
          <div>
            <h3>Adeel — Funding Intelligence (Upstream / Data Engine)</h3>
            <ul>
              <li>Automates discovery of funding types: grants, rebates, bursaries, RFPs/RFQs, co‑marketing funds.</li>
              <li>Structures into Proof360’s schema with region, vertical, eligibility, and ProofScore.</li>
              <li>Collaborates with Manjiri (schema), Abhinav (AI tagging), Yinka (financial classification).</li>
            </ul>
          </div>
          <div>
            <h4 className={styles.subtleTitle}>B2B vs B2C mapping</h4>
            <ul className={styles.mapping}>
              <li><span className={`${styles.badge} ${styles.b2b}`}>B2B</span> RFPs / RFQs / Tenders</li>
              <li><span className={`${styles.badge} ${styles.both}`}>Both</span> Rebates</li>
              <li><span className={`${styles.badge} ${styles.both}`}>Both</span> Grants / Funding / Bursaries</li>
              <li><span className={`${styles.badge} ${styles.b2b}`}>B2B</span> Co‑Marketing Funds</li>
            </ul>
          </div>
        </section>

        <section id="shubham" className={styles.card}>
          <h3>Shubham — Funding Monetization (Midstream / Activation Layer)</h3>
          <ul>
            <li>Turns Adeel’s structured data into active offers visible across our ecosystem.</li>
            <li>Works with Aastha & Rahman to deploy dynamic funding and rebate offers.</li>
            <li>Partners with Jeremy to align vendors to RFPs/RFQs.</li>
            <li>Coordinates with Yinka for financial validation and ROI tracking.</li>
          </ul>
        </section>

        <section id="architect" className={styles.card}>
          <h3>Monetization & Financing Architect (Upcoming Role)</h3>
          <ul>
            <li>Owns repayable and credit‑based programs — BNPL, vendor credit, 0% financing, lease‑to‑own, etc.</li>
            <li>Works with Yinka to integrate repayment, financing, and ROI systems into Proof360.</li>
          </ul>
        </section>

        <section id="flow" className={styles.steps}>
          <h3>The Flow</h3>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.kicker}>Discovery (Upstream)</div>
              <div className={styles.owner}>Owner: Adeel</div>
              <p>Finds, structures, and scores all opportunities.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.kicker}>Activation (Midstream)</div>
              <div className={styles.owner}>Owner: Shubham</div>
              <p>Validates, activates, and deploys offers to marketing, vendors, and customers.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.kicker}>Financing (Parallel)</div>
              <div className={styles.owner}>Owner: Monetization & Financing Architect</div>
              <p>Designs and manages credit and payment systems.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.kicker}>Finance Oversight (Downstream)</div>
              <div className={styles.owner}>Owner: Yinka</div>
              <p>Tracks ROI, inflows, reimbursements, and lifecycle credits.</p>
            </div>
          </div>
        </section>

        <section id="phases" className={styles.card}>
          <h3>Adeel’s 12‑Week Phased Approach</h3>
          <ol className={styles.phases}>
            <li className={styles.phase}>
              <span className={styles.phaseBadge}>Phase 1</span>
              <div>
                <div className={styles.phaseTitle}>Week 1 — Transition FVG Global Assist → Proof Response</div>
                <div className={styles.phaseDesc}>Move automations to recruit.proofresponse.com; wire APIs (/api/newCandidate, /api/requestIntro, /api/jobComplete); create city + service URLs.</div>
              </div>
            </li>
            <li className={styles.phase}>
              <span className={styles.phaseBadge}>Phase 2</span>
              <div>
                <div className={styles.phaseTitle}>Weeks 2–5 — Build the Funding Intelligence Engine</div>
                <div className={styles.phaseDesc}>Automate grants, rebates, RFPs; normalize into OffersCanonical; apply ProofScore; QA accuracy ≥ 95%.</div>
              </div>
            </li>
            <li className={styles.phase}>
              <span className={styles.phaseBadge}>Phase 3</span>
              <div>
                <div className={styles.phaseTitle}>Weeks 6–9 — Integrate with Proof360 + launch across 5 cities</div>
                <div className={styles.phaseDesc}>Link Recruiting + Funding data; unified dashboards; activate Calgary → Winnipeg → Edmonton → Saskatoon → Regina; train ProofScore on closed wins.</div>
              </div>
            </li>
            <li className={styles.phase}>
              <span className={styles.phaseBadge}>Phase 4</span>
              <div>
                <div className={styles.phaseTitle}>Weeks 10–12 — Optimize & Globalize</div>
                <div className={styles.phaseDesc}>Add global fields (country, FX rate); refactor pipelines; finalize performance reports; document runbooks in Proof360 Registry.</div>
              </div>
            </li>
          </ol>
        </section>

        <section id="why" className={styles.card}>
          <h3>Why this matters</h3>
          <p>
            Adeel’s system powers both sides of our business — <strong>B2B</strong> (RFPs, RFQs, vendor grants, co‑marketing funds) and <strong>B2C</strong> (rebates, residential funding, bursaries, consumer energy programs). His work ensures Proof360 always knows what funding exists, who it applies to, and how to activate it — giving our marketing, vendor, and finance teams the intelligence they need to execute fast and accurately.
          </p>
        </section>

        <p className={styles.closing}>
          Welcome aboard, Adeel — excited to scale the Proof Response Funding Intelligence Engine ⚡
        </p>
      </div>
    </section>
  );
}


