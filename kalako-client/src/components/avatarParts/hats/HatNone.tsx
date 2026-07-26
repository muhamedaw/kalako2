interface Props { size?: number; className?: string }

export default function HatNone({ size = 720, className }: Props) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className} />
}
