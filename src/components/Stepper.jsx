/**
 * Barre de progression : 3 segments. Le segment actif (et les précédents) sont
 * rouges ; les suivants restent gris clair.
 *
 * @param {{ etapes: string[], indexActif: number }} props
 */
export default function Stepper({ etapes, indexActif }) {
  return (
    <ol className="stepper" aria-label="Progression de la demande">
      {etapes.map((etape, index) => {
        const etat =
          index < indexActif ? 'is-done' : index === indexActif ? 'is-active' : '';
        return (
          <li key={etape} className={`stepper__item ${etat}`}>
            <span className="stepper__bar" />
            <span className="stepper__label">{etape}</span>
          </li>
        );
      })}
    </ol>
  );
}
