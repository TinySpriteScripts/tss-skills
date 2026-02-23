onPlayerLoaded(function()
    debugPrint("Player logged in")
    TriggerServerEvent('tss-skills:server:PlayerLoaded')
end, true)

local function deepCopy(tbl)
    local copy = {}
    for k, v in pairs(tbl) do
        copy[k] = type(v) == "table" and deepCopy(v) or v
    end
    return copy
end


RegisterCommand('skills',function()
    local result = triggerCallback("tss-skills:server:GetAllData")
    if not result then return end
    local SkillKeys = deepCopy(Config.SkillKeys)
    for k,v in pairs(Config.SkillKeys) do
        if result[k] ~= nil then
            SkillKeys[k].CurrentXP = result[k]
        end
    end

    local action = 'open-skills-menu'
    SendNUIMessage({
        action = action,
        levelData = SkillKeys
    })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('close-skills', function(data, cb)
    SetNuiFocus(false, false)
end)