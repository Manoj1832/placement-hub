export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Community Guidelines</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Be Authentic</h2>
          <p className="text-muted-foreground">
            Share genuine interview experiences. Do not fabricate or exaggerate details.
            All submissions are reviewed by admins.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Be Respectful</h2>
          <p className="text-muted-foreground">
            Maintain professionalism when describing companies, interviewers, and processes.
            Do not include personal identifiable information of others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Be Helpful</h2>
          <p className="text-muted-foreground">
            Focus on providing actionable insights - tips, questions asked, round details.
            This community is for helping fellow students succeed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Privacy</h2>
          <p className="text-muted-foreground">
            You can submit anonymously. Your identity is never shared without consent.
            Do not mention names of interviewers in your submissions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. No Spam</h2>
          <p className="text-muted-foreground">
            Do not use this platform for promotional purposes. Reserved for genuine placement experiences only.
          </p>
        </section>
      </div>
    </div>
  );
}