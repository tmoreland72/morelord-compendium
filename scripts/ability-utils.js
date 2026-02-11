/**
 * Set an ability score on an actor
 * @param {Actor} actor
 * @param {string} ability  e.g. "str", "dex", "con", "int", "wis", "cha"
 */
export async function setAbility(actor, ability) {
    if (!actor) {
        ui.notifications.warn("You are not associated with a character.");
        return;
    }

    const validAbilities = Object.keys(actor.system.abilities);

    if (!validAbilities.includes(ability)) {
        ui.notifications.error(`Invalid ability: ${ability}`);
        return;
    }

    const r = new Roll("3d6")
    await r.evaluate()

    await r.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling ability score for ${ability.toUpperCase()}`,
    });
    
    ui.notifications.info(`Setting ${ability.toUpperCase()} to ${r.total} for ${actor.name}`);

    const path = `system.abilities.${ability}.value`;
    await actor.update({ [path]: Number(r.total) });
}