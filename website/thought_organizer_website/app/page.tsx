import { NavHeader } from '@/components/nav-header'
import { PainPoints } from '@/components/pain-points'
import { WorkflowDemo } from '@/components/workflow-demo'
import { PrivacySection } from '@/components/privacy-section'
import { Footer } from '@/components/footer'
import { WorkflowExamples } from '@/components/workflow-examples'
import { HeroSection } from '@/components/hero-section'

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main>
        <HeroSection />
        <PainPoints />
        <WorkflowDemo />
        <PrivacySection />
        <WorkflowExamples />
      </main>
      <Footer />
    </div>
  )
}

