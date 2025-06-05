GlobalLevelCache = {}

local function updateLevelCache(cid, data)
    GlobalLevelCache[cid] = GlobalLevelCache[cid] or {}
    GlobalLevelCache[cid] = data
end

RegisterNetEvent('tss-skills:server:PlayerLoaded',function()
    local Player = getPlayer(source)
    local cid = Player.citizenId
    local Data = {}
    MySQL.rawExecute('SELECT * FROM player_skills WHERE citizenid = ?', { cid }, function(result)
        if not result[1] then
            for k,v in pairs(Config.SkillKeys) do
                Data[k] = 1
            end
            MySQL.insert('INSERT INTO player_skills (citizenid, levelData) VALUES (?, ?)', {
                cid,
                json.encode(Data),
            })
            updateLevelCache(cid, Data)
        else 
            local CurrentLevelData = json.decode(result[1].levelData) 
            for k,v in pairs(Config.SkillKeys) do
                if CurrentLevelData[k] == nil then
                    CurrentLevelData[k] = 1
                end
            end
            for k,v in pairs(CurrentLevelData) do
                if Config.SkillKeys[k]== nil then
                    CurrentLevelData[k] = nil
                end
            end
            local final = json.encode(CurrentLevelData)
            MySQL.update('UPDATE player_skills SET levelData = ? WHERE citizenid = ?', { final, cid })   
            updateLevelCache(cid, CurrentLevelData)
        end
    end)
end)

-- AddXP

RegisterNetEvent('tss-skills:server:AddXP',function(skill, xp)
    if not source then return end
    AddXP(skill, xp, source)
end)

function AddXP(skill, xp, src)
    if not src then return end
    if not Config.SkillKeys[skill] then print("error wrong skill code") return end
    if not xp then xp = 1 end
    
    local Player = getPlayer(src)
    local cid = Player.citizenId

    if GlobalLevelCache[cid] then
        local storedData = GlobalLevelCache[cid]
        local configLevelTable = Config.SkillKeys
        if storedData[skill] ~= nil then
            local currentValue = storedData[skill]
            local value_to_add = tonumber(xp)
            local new_value = math.floor(currentValue + value_to_add)
            storedData[skill] = new_value
            local final = json.encode(storedData)
            MySQL.update('UPDATE player_skills SET levelData = ? WHERE citizenid = ?', { final, cid })
            updateLevelCache(cid, storedData)
            
        else
            print("error storedData is nil")
        end
    end 
end


-- RemoveXP

RegisterNetEvent('tss-skills:server:RemoveXP',function(skill, xp)
    if not source then return end
    RemoveXP(skill, xp, source)
end)

function RemoveXP(skill, xp, src)
    if not src then return end
    if not Config.SkillKeys[skill] then print("error wrong skill code") return end
    if not xp then xp = 1 end
    
    local Player = getPlayer(src)
    local cid = Player.citizenId

    if GlobalLevelCache[cid] then
        local storedData = GlobalLevelCache[cid]
        local configLevelTable = Config.SkillKeys
        if storedData[skill] ~= nil then
            local currentValue = storedData[skill]
            local value_to_remove = tonumber(xp)
            local new_value = math.floor(currentValue - value_to_remove)
            if new_value < 0 then new_value = 0 end
            storedData[skill] = new_value
            local final = json.encode(storedData)
            MySQL.update('UPDATE player_skills SET levelData = ? WHERE citizenid = ?', { final, cid })
            updateLevelCache(cid, storedData)
            
        else
            print("error storedData is nil")
        end
    end
end

-- Returning Data

createCallback("tss-skills:server:GetSkillData", function(source, skill)
    if not source then return end
	local Player = getPlayer(source)
    if not Player then return end
    local cid = Player.citizenId
    if not cid then return end

    if not Config.SkillKeys[skill] then return end
    if not GlobalLevelCache[cid] then return end
    if not GlobalLevelCache[cid][skill] then return end

    return GlobalLevelCache[cid][skill]
end)

function GetLevelData(src, skill)
    if not src then return end
	local Player = getPlayer(src)
    if not Player then return end
    local cid = Player.citizenId
    if not cid then return end

    if not Config.SkillKeys[skill] then return end
    if not GlobalLevelCache[cid] then return end
    if not GlobalLevelCache[cid][skill] then return end

    return GlobalLevelCache[cid][skill]
end

createCallback("tss-skills:server:GetAllData", function(source)
    if not source then return end
	local Player = getPlayer(source)
    if not Player then return end
    local cid = Player.citizenId
    if not cid then return end

    if not GlobalLevelCache[cid] then return end

    return GlobalLevelCache[cid]
end)

function GetAllData(src)
    if not src then return end
	local Player = getPlayer(src)
    if not Player then return end
    local cid = Player.citizenId
    if not cid then return end

    if not GlobalLevelCache[cid] then return end

    return GlobalLevelCache[cid]
end



exports('AddXP', AddXP)
exports('RemoveXP', RemoveXP)
exports('GetLevelData', GetLevelData)
exports('GetAllData', GetAllData)