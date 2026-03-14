import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AlertData {
  title: string
  category: string
  aiSummary: string
  rawUrl: string
  deadline?: string
}

interface DailyAlertEmailProps {
  userName: string
  alerts: AlertData[]
  dashboardUrl: string
  date: string
}

export default function DailyAlertEmail({
  userName,
  alerts,
  dashboardUrl,
  date,
}: DailyAlertEmailProps) {
  const hasAlerts = alerts.length > 0
  const subject = hasAlerts
    ? `${alerts.length} alerta${alerts.length > 1 ? 's' : ''} del BOE para ti hoy`
    : 'Sin novedades relevantes hoy'

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#1a1a1a' }}>BOE Alert — {date}</Heading>

          <Text>Hola {userName},</Text>

          {hasAlerts ? (
            <>
              <Text>
                Hoy hemos encontrado <strong>{alerts.length} novedad</strong>
                {alerts.length > 1 ? 'es' : ''} relevante{alerts.length > 1 ? 's' : ''} para tu
                perfil:
              </Text>

              {alerts.map((alert, index) => (
                <Section
                  key={index}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', margin: '0 0 8px' }}>{alert.title}</Text>
                  <Text style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px' }}>
                    {alert.category}
                    {alert.deadline ? ` · Plazo: ${alert.deadline}` : ''}
                  </Text>
                  <Text style={{ margin: '0 0 12px' }}>{alert.aiSummary}</Text>
                  <Link href={alert.rawUrl} style={{ color: '#2563eb' }}>
                    Ver documento oficial →
                  </Link>
                </Section>
              ))}
            </>
          ) : (
            <Text>
              Hoy no hemos encontrado novedades relevantes para tu perfil en el BOE. Te avisaremos
              en cuanto aparezca algo de tu interés.
            </Text>
          )}

          <Hr />

          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Ver todas tus alertas →
          </Button>

          <Text style={{ fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
            BOE Alert · Para dejar de recibir estos emails, gestiona tu suscripción desde el panel.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
