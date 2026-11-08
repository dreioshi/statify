import PageHeader from "@/components/ui/PageHeader";

export default function StudyGuide() {
  return (
    <>
      <PageHeader
        title="Study Guide"
        description="Lesson refreshers, formulas, and worked examples for Simple Linear Regression and Correlation (Module 7) and Hypothesis Testing (Module 9)."
      />

      <div className="two-column guide-columns">
        {/* ───────── Module 7 ───────── */}
        <section className="panel">
          <span className="module-tag">Module 7</span>
          <h2>Simple Linear Regression &amp; Correlation</h2>

          <details open>
            <summary>Independent and dependent variables</summary>
            <p>
              The <b>independent variable</b> is the factor that the researcher manipulates or
              controls in an experiment. The <b>dependent variable</b> is the outcome or response
              that the researcher measures or observes during the experiment.
            </p>
            <p>
              Example: road works (a barrier on the road) are the independent variable, and the
              resulting traffic is the dependent variable. Ask which variable changes because of
              the other: that one is dependent.
            </p>
          </details>

          <details>
            <summary>Regression analysis</summary>
            <p>
              Regression analysis is a statistical method of estimating how a response variable
              depends on one or more predictors. It deals with:
            </p>
            <ul>
              <li>Finding the best relationship between two or more variables.</li>
              <li>Quantifying the strength of that relationship.</li>
              <li>
                Using methods that allow prediction of the response values, given the values of the
                regressor variable.
              </li>
            </ul>
            <p>
              Change in predictors (independent variable, x) leads to change in response
              (dependent variable, y).
            </p>
          </details>

          <details>
            <summary>The regression line and simple linear model</summary>
            <p>
              The regression line shows the relationship of the variables and is used for
              prediction, that is, estimating the possible values of a variable. The best line of
              fit is the regression line.
            </p>
            <div className="formula">Y = α + βx + e</div>
            <ul>
              <li><b>Y</b> = dependent variable</li>
              <li><b>x</b> = independent variable</li>
              <li><b>α</b> = y-intercept</li>
              <li><b>β</b> = slope of the line</li>
              <li><b>e</b> = error variance or residual variance</li>
            </ul>
            <p>
              This line is a reasonable approximation that may be operative within a confined
              range of x. Models that simplify more complicated and unknown structures are usually
              linear, simple, and empirical, so they are called <b>empirical models</b>.
            </p>
            <p><b>Important assumptions:</b></p>
            <ul>
              <li>Y is a random variable, since e is random.</li>
              <li>The value of x is not random and is measured with negligible error.</li>
              <li>
                The quantity e, called the random error or random disturbance, has constant
                variance (the homogeneous variance assumption).
              </li>
            </ul>
          </details>

          <details>
            <summary>Fitted line vs. true line, and the scatter diagram</summary>
            <p>The <b>fitted regression line</b> is the estimated line calculated from sample data:</p>
            <div className="formula">ŷ = b₀ + b₁x &nbsp;or&nbsp; ŷ = a + bx</div>
            <p>
              ŷ is the predicted or fitted value. b₀ and b₁ (or a and b) are sample estimates of
              the true parameters.
            </p>
            <p>The <b>true regression line</b> is:</p>
            <div className="formula">μ(Y|x) = β₀ + β₁x</div>
            <p>
              μ(Y|x) is the true mean, β₀ is the true y-intercept, and β₁ is the true slope.
            </p>
            <p>
              A <b>scatter diagram</b> is a plot of the values of x against the values of y.
            </p>
          </details>

          <details>
            <summary>Residuals</summary>
            <p>
              A residual (error, ε) is the difference between the actual value of Y and the
              predicted value of Y.
            </p>
            <div className="formula">εᵢ = yᵢ − ŷ</div>
            <ul>
              <li><b>Positive residual:</b> the actual value is located above the regression line.</li>
              <li><b>Negative residual:</b> the actual value falls below the regression line.</li>
              <li><b>Small residuals</b> are signs of a good fit.</li>
            </ul>
            <p>
              <b>Example:</b> given ŷ for x = 1 to 6 as 1.8, 2.1, 2.4, 2.7, 3.0, 3.3 and actual y as
              2, 1.5, 2.5, 2, 3.5, 4.5, the residuals are 0.2, −0.6, 0.1, −0.7, 0.5, 1.2. The
              predicted values rise by 0.3 per step, so the slope is 0.3. At x = 5 the prediction is
              3.0, so the y-intercept is 3.0 − 0.3(5) = 1.5.
            </p>
          </details>

          <details>
            <summary>Least-squares approach</summary>
            <p>
              The least squares regression line is the straight line that best fits a set of data
              points by making the total squared vertical distance (residuals) between the points
              and the line as small as possible.
            </p>
            <div className="formula">y′ = A + Bx</div>
            <div className="formula">A = [(Σy)(Σx²) − (Σx)(Σxy)] / [n(Σx²) − (Σx)²]</div>
            <div className="formula">B = [n(Σxy) − (Σx)(Σy)] / [n(Σx²) − (Σx)²]</div>
            <p>
              A is the y-intercept, B is the slope of the line, and n is the number of samples.
              Build a table with the columns x, y, x², and xy, add each column to get Σx, Σy, Σx²,
              and Σxy, then substitute into the formulas.
            </p>
          </details>

          <details>
            <summary>Least-squares example: late arrivals and final grade</summary>
            <p>
              Number of late (x): 5, 10, 4, 0, 7. Final grade (y): 78, 70, 89, 94, 76.
            </p>
            <p>
              n = 5, Σx = 26, Σy = 407, Σx² = 190, Σxy = 1978
            </p>
            <div className="formula">B = (5·1978 − 26·407) / (5·190 − 26²) = −692 / 274 = −2.526</div>
            <div className="formula">A = (407·190 − 26·1978) / 274 = 25902 / 274 = 94.533</div>
            <p>
              The regression line is <b>y′ = 94.533 − 2.526x</b>. Each additional late lowers the
              predicted final grade by about 2.526 points, and a student with no lates is predicted
              to get about 94.53.
            </p>
          </details>

          <details>
            <summary>Correlation and the Pearson coefficient (r)</summary>
            <p>
              Correlation is a statistical measure that describes the extent to which two
              variables change together. It quantifies the degree to which there is a linear
              relationship between two sets of data.
            </p>
            <p>
              The <b>Pearson correlation coefficient</b>, denoted r, measures the strength and
              direction of a linear relationship between two variables.
            </p>
            <div className="formula">
              r = [n(Σxy) − (Σx)(Σy)] / √{"{"}[nΣx² − (Σx)²][nΣy² − (Σy)²]{"}"}
            </div>
            <p>
              The sign of r gives the direction (positive or negative). The size of r gives the
              strength:
            </p>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr><th>Size of correlation</th><th>Interpretation</th></tr>
                </thead>
                <tbody>
                  <tr><td>.90 to 1.00 (−.90 to −1.00)</td><td>Very high positive (negative) correlation</td></tr>
                  <tr><td>.70 to .90 (−.70 to −.90)</td><td>High positive (negative) correlation</td></tr>
                  <tr><td>.50 to .70 (−.50 to −.70)</td><td>Moderate positive (negative) correlation</td></tr>
                  <tr><td>.30 to .50 (−.30 to −.50)</td><td>Low positive (negative) correlation</td></tr>
                  <tr><td>.00 to .30 (.00 to −.30)</td><td>Negligible correlation</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <b>Example:</b> for the late-arrivals data, Σy² = 33517, so
              r = (5·1978 − 26·407) / √[(274)(5·33517 − 407²)] = −692 / √(274 · 1936) = −0.950, a{" "}
              <b>very high negative</b> correlation: more lates go with lower grades.
            </p>
          </details>

          <details>
            <summary>Practice 1: hours studied and exam score</summary>
            <p>
              X (hours): 2, 3, 4, 5, 6, 7, 8, 9, 10, 11. Y (score): 65, 75, 82, 88, 92, 98, 105,
              112, 118, 122. Find the regression line, interpret the slope and intercept, and
              predict the score for 12 hours.
            </p>
            <p>n = 10, Σx = 65, Σy = 957, Σx² = 505, Σxy = 6731</p>
            <div className="formula">B = (10·6731 − 65·957) / (10·505 − 65²) = 5105 / 825 = 6.188</div>
            <div className="formula">A = (957·505 − 65·6731) / 825 = 45770 / 825 = 55.479</div>
            <p>
              Regression line: <b>y′ = 55.479 + 6.188x</b>.
            </p>
            <ul>
              <li><b>Slope (6.188):</b> each extra hour of study adds about 6.19 points to the predicted score.</li>
              <li><b>Intercept (55.479):</b> the predicted score with 0 hours of study.</li>
              <li><b>Prediction at 12 hours:</b> 55.479 + 6.188(12) = 129.73.</li>
            </ul>
            <p>
              The correlation is r = 0.997, a very high positive correlation. Note that 12 hours is
              outside the studied range of 2 to 11 hours, so that prediction goes beyond the data.
            </p>
          </details>

          <details>
            <summary>Practice 2: age and price of a used car</summary>
            <p>
              Age of car (x, years): 1, 2, 2, 3, 4, 5. Price (y, thousand euros): 29, 25, 21, 18,
              15, 15. Estimate the worth of a car about three years old.
            </p>
            <p>n = 6, Σx = 17, Σy = 123, Σx² = 59, Σxy = 310</p>
            <div className="formula">B = (6·310 − 17·123) / (6·59 − 17²) = −231 / 65 = −3.554</div>
            <div className="formula">A = (123·59 − 17·310) / 65 = 1987 / 65 = 30.569</div>
            <p>
              Regression line: <b>y′ = 30.569 − 3.554x</b>. For x = 3:
              y′ = 30.569 − 3.554(3) = <b>19.91</b>, so the car is worth about 19.9 thousand euros.
              The correlation is r = −0.926, a very high negative correlation: older cars sell for
              less.
            </p>
          </details>
        </section>

        {/* ───────── Module 9 ───────── */}
        <section className="panel">
          <span className="module-tag violet-tag">Module 9</span>
          <h2>Hypothesis Testing</h2>

          <details open>
            <summary>Null and alternative hypotheses</summary>
            <p>
              The null hypothesis is denoted H₀ and the alternative hypothesis is denoted H₁.
              H₀ always carries the equality (=, ≤, or ≥) and H₁ never does.
            </p>
            <p>
              Example in numbers: H₀: μ = 85% and H₁: μ ≠ 85%.
            </p>
            <p>
              Example in research: H₀ says there is <i>no</i> significant difference between the
              academic performance of working and non-working students, and H₁ says there <i>is</i>{" "}
              a significant difference.
            </p>
            <p>
              The sign in H₁ decides the type of test. Words like different mean ≠ (two-tailed),
              greater or increased mean &gt; (right-tailed), and less or decreased mean &lt;
              (left-tailed).
            </p>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr><th>Two-tailed</th><th>Left-tailed (one-tailed)</th><th>Right-tailed (one-tailed)</th></tr>
                </thead>
                <tbody>
                  <tr><td>H₀: μ = 23</td><td>H₀: μ ≥ 23</td><td>H₀: μ ≤ 23</td></tr>
                  <tr><td>H₁: μ ≠ 23</td><td>H₁: μ &lt; 23</td><td>H₁: μ &gt; 23</td></tr>
                </tbody>
              </table>
            </div>
          </details>

          <details>
            <summary>Level of significance (α)</summary>
            <p>
              The level of significance is represented by the Greek letter alpha (α). Commonly used
              values range from 0.01 to 0.10, particularly 0.05 (5%) and 0.01 (1%).
            </p>
            <ul>
              <li>The smaller the level of significance, the smaller the possibility of rejecting a null hypothesis.</li>
              <li>The level of significance is the rejection region.</li>
              <li>The confidence level is computed as 1 − α.</li>
            </ul>
            <p>Example: α = 0.05 gives a confidence level of 1 − 0.05 = 0.95, or 95%.</p>
          </details>

          <details>
            <summary>General procedure of hypothesis testing</summary>
            <ol>
              <li>State the null hypothesis (H₀).</li>
              <li>State the alternative hypothesis (H₁).</li>
              <li>Set α.</li>
              <li>Collect data.</li>
              <li>Calculate a test statistic.</li>
              <li>Construct acceptance/rejection regions.</li>
              <li>Based on steps 5 and 6, draw a conclusion about H₀.</li>
            </ol>
          </details>

          <details>
            <summary>Z-test: when to use it</summary>
            <p>
              The Z-test is the simplest and most common test regarding the significance of sample
              data. It is used if the sample size is 30 or more. It can be applied in two ways: a{" "}
              <b>one-sample mean test</b> and a <b>two-sample mean test</b>.
            </p>
            <p>Critical Z values used in the examples below:</p>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr><th>α</th><th>Two-tailed</th><th>Right-tailed</th><th>Left-tailed</th></tr>
                </thead>
                <tbody>
                  <tr><td>0.10</td><td>±1.645</td><td>+1.282</td><td>−1.282</td></tr>
                  <tr><td>0.05</td><td>±1.960</td><td>+1.645</td><td>−1.645</td></tr>
                  <tr><td>0.01</td><td>±2.576</td><td>+2.326</td><td>−2.326</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Reject H₀ when Z falls in the rejection region (beyond the critical value in the
              direction of H₁). Otherwise, fail to reject H₀.
            </p>
          </details>

          <details>
            <summary>One-sample Z-test</summary>
            <div className="formula">z = (x̄ − μ) / (σ / √n)</div>
            <p>
              x̄ is the sample mean, μ is the claimed (hypothesized) mean, σ is the population
              standard deviation, and n is the sample size.
            </p>
            <p>
              <b>Example 1 (luggage):</b> A traveler claims his luggage weighs 40 kilos on average
              (σ = 9.5). A sample of 50 pieces averages 38 kilos. Test at α = 0.05.
            </p>
            <ul>
              <li>H₀: μ = 40; H₁: μ ≠ 40 (two-tailed)</li>
              <li>z = (38 − 40) / (9.5/√50) = −2 / 1.3435 = <b>−1.489</b></li>
              <li>Critical values: ±1.960</li>
              <li>−1.489 is inside the acceptance region, so <b>fail to reject H₀</b>: there is not enough evidence to disagree with the claim.</li>
            </ul>
            <p>
              <b>Example 2 (cereal boxes):</b> A manufacturer claims a mean weight of 500 grams. A
              sample of 36 boxes averages 495 grams (σ = 10). Is the mean different? α = 0.05.
            </p>
            <ul>
              <li>H₀: μ = 500; H₁: μ ≠ 500 (two-tailed)</li>
              <li>z = (495 − 500) / (10/√36) = −5 / 1.6667 = <b>−3.000</b></li>
              <li>Critical values: ±1.960</li>
              <li>−3.000 is beyond −1.960, so <b>reject H₀</b>: the mean weight is different from 500 grams.</li>
            </ul>
            <p>
              <b>Example 3 (test scores):</b> A school district claims its average score is higher
              than 75. A sample of 100 students averages 78 (σ = 8). One-tailed test, α = 0.05.
            </p>
            <ul>
              <li>H₀: μ ≤ 75; H₁: μ &gt; 75 (right-tailed)</li>
              <li>z = (78 − 75) / (8/√100) = 3 / 0.8 = <b>3.750</b></li>
              <li>Critical value: +1.645</li>
              <li>3.750 is beyond 1.645, so <b>reject H₀</b>: there is enough evidence to support the claim.</li>
            </ul>
          </details>

          <details>
            <summary>Two-sample Z-test</summary>
            <p>
              When two separate samples are drawn at random, they generate two sample means, x̄₁
              and x̄₂. Assuming the samples come from normal populations, we can test whether the
              difference between the two means is significant.
            </p>
            <div className="formula">z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)</div>
            <p>
              <b>Example (grades):</b> 50 full-time students averaged 95 with a variance of 10.5,
              and 50 working students averaged 88 with a variance of 8.5. Is there a significant
              difference in the mean grade at α = 0.05?
            </p>
            <ul>
              <li>H₀: μ₁ = μ₂; H₁: μ₁ ≠ μ₂ (two-tailed)</li>
              <li>Standard error = √(10.5/50 + 8.5/50) = √0.38 = 0.6164</li>
              <li>z = (95 − 88) / 0.6164 = <b>11.355</b></li>
              <li>Critical values: ±1.960</li>
              <li>11.355 is far beyond 1.960, so <b>reject H₀</b>: there is a significant difference in the mean grades.</li>
            </ul>
          </details>

          <details>
            <summary>One-sample t-test</summary>
            <p>
              To draw an inference on a mean in one population whose entries are normally
              distributed but whose variance is not known, a t-test is used. It is also used when
              the sample size is less than 30.
            </p>
            <div className="formula">t = (x̄ − μ) / (s / √n)</div>
            <p>
              x̄ = observed mean of the sample, μ = assumed mean, s = sample standard deviation,
              n = sample size.
            </p>
            <div className="formula">df = n − 1</div>
            <p>
              Find the critical t value in the t-table using the degrees of freedom (df) and α.
            </p>
            <p>
              <b>Example 1 (light bulbs):</b> A firm&apos;s light bulbs average 725 hours (standard
              deviation 40). A sample of 20 bulbs averages 700 hours. Test whether the life span is
              less than 725 hours at α = 0.05.
            </p>
            <ul>
              <li>H₀: μ ≥ 725; H₁: μ &lt; 725 (left-tailed)</li>
              <li>t = (700 − 725) / (40/√20) = −25 / 8.944 = <b>−2.795</b>, with df = 19</li>
              <li>Critical value: −1.729</li>
              <li>−2.795 is beyond −1.729, so <b>reject H₀</b>: the life span is less than 725 hours.</li>
            </ul>
            <p>
              <b>Example 2 (coffee shop):</b> A coffee shop claims the average waiting time is less
              than 4 minutes. A sample of 25 orders averages 3.6 minutes (s = 0.8). One-tailed
              t-test, α = 0.05.
            </p>
            <ul>
              <li>H₀: μ ≥ 4; H₁: μ &lt; 4 (left-tailed)</li>
              <li>t = (3.6 − 4) / (0.8/√25) = −0.4 / 0.16 = <b>−2.500</b>, with df = 24</li>
              <li>Critical value: −1.711</li>
              <li>−2.500 is beyond −1.711, so <b>reject H₀</b>: there is enough evidence that the waiting time is less than 4 minutes.</li>
            </ul>
            <p>
              (These two examples do not state α or the tail, so α = 0.05 and the tail that matches
              the claim are used.)
            </p>
          </details>

          <details>
            <summary>Two-sample t-test</summary>
            <p>
              When comparing two sample means with unknown variances, use:
            </p>
            <div className="formula">t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)</div>
            <p>
              x̄₁, x̄₂ = observed means of the 1st and 2nd sample; s₁, s₂ = standard deviations of the
              1st and 2nd sample; n₁, n₂ = sample sizes. The hypotheses compare the two means
              (H₀: μ₁ = μ₂, or one-tailed versions).
            </p>
            <div className="formula">df = min(n₁ − 1, n₂ − 1)</div>
            <p>
              The df is the smaller of the two sample sizes minus one. This is the conservative
              rule. Statistical software (R, SPSS) uses the Welch–Satterthwaite df, which is usually
              larger, so its results can differ slightly.
            </p>
            <p>
              <b>Example 1 (public vs. private school):</b> Group 1: n = 10, x̄ = 86, s² = 48.
              Group 2: n = 12, x̄ = 88, s² = 38. Test for a difference at α = 0.05.
            </p>
            <ul>
              <li>H₀: μ₁ = μ₂; H₁: μ₁ ≠ μ₂ (two-tailed)</li>
              <li>Standard error = √(48/10 + 38/12) = √7.967 = 2.8225</li>
              <li>t = (86 − 88) / 2.8225 = <b>−0.709</b>, with df = min(9, 11) = 9</li>
              <li>Critical values: ±2.262</li>
              <li>−0.709 is inside the acceptance region, so <b>fail to reject H₀</b>: no significant difference.</li>
            </ul>
            <p>
              <b>Example 2 (teaching methods):</b> Method A: 30 students, mean 75, s = 8. Method B:
              35 students, mean 78, s = 7. Is method B&apos;s average significantly higher? One-tailed,
              α = 0.05.
            </p>
            <ul>
              <li>H₀: μ_B ≤ μ_A; H₁: μ_B &gt; μ_A (right-tailed)</li>
              <li>Standard error = √(7²/35 + 8²/30) = √3.533 = 1.8797</li>
              <li>t = (78 − 75) / 1.8797 = <b>1.596</b>, with df = min(34, 29) = 29</li>
              <li>Critical value: +1.699</li>
              <li>1.596 is below 1.699, so <b>fail to reject H₀</b>: not enough evidence that method B is higher.</li>
            </ul>
          </details>

          <details>
            <summary>Z-test or t-test?</summary>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr><th>Situation</th><th>Test</th></tr>
                </thead>
                <tbody>
                  <tr><td>Sample size is 30 or more (σ known)</td><td>Z-test</td></tr>
                  <tr><td>Variance (σ) is not known, population normal</td><td>t-test</td></tr>
                  <tr><td>Sample size is less than 30</td><td>t-test</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </section>
      </div>
    </>
  );
}