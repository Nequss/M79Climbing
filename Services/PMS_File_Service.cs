/*
 * 
 * Big thanks to:
 * Chrisgbk for creating PMS file format structure definition
 * Rosenrot for general help with understanding everything! 
 * https://github.com/sec0nd-n4ture
 * 
 * 
 */

using M79Climbing.Models.PMS;

namespace M79Climbing.Services
{
    public class PMS_File_Service
    {
        public async Task<PMS_FILE> ReadPMSFile(string filePath)
        {
            PMS_FILE pmsFile = new PMS_FILE();

            using (var br = new BinaryReader(File.Open(filePath, FileMode.Open)))
            {
                // general
                pmsFile.header = new PMS_HEADER(br.ReadUInt32());
                pmsFile.options = new PMS_OPTIONS(br);

                // polygons
                pmsFile.polygonCount = br.ReadUInt32();
                pmsFile.polygons = new PMS_POLYGON[pmsFile.polygonCount];

                for (int i = 0; i < pmsFile.polygonCount; i++)
                {
                    pmsFile.polygons[i] = new PMS_POLYGON(br);
                }

                // sectors
                pmsFile.sectorDivision = br.ReadUInt32();
                pmsFile.numSectors = br.ReadUInt32();

                int gridSize = (int)(pmsFile.numSectors * 2) + 1;

                pmsFile.sectors = new PMS_SECTOR[gridSize, gridSize];

                for (int i = 0; i < gridSize; i++)
                {
                    for (int j = 0; j < gridSize; j++)
                    {
                        pmsFile.sectors[i, j] = new PMS_SECTOR(br);
                    }
                }

                // props
                pmsFile.propCount = br.ReadInt32();
                pmsFile.props = new PMS_PROP[pmsFile.propCount];

                for (int i = 0; i < pmsFile.propCount; i++)
                {
                    pmsFile.props[i] = new PMS_PROP(br);
                }

                // scenery
                pmsFile.sceneryCount = br.ReadInt32();
                pmsFile.scenery = new PMS_SCENERY[pmsFile.sceneryCount];

                for (int i = 0; i < pmsFile.sceneryCount; i++)
                {
                    pmsFile.scenery[i] = new PMS_SCENERY(br);
                }

                // colliders
                pmsFile.colliderCount = br.ReadInt32();
                pmsFile.colliders = new PMS_COLLIDER[pmsFile.colliderCount];

                for (int i = 0; i < pmsFile.colliderCount; i++)
                {
                    pmsFile.colliders[i] = new PMS_COLLIDER(br);
                } 

                // spawnpoints
                pmsFile.spawnpointCount = br.ReadInt32();
                pmsFile.spawnpoints = new PMS_SPAWNPOINT[pmsFile.spawnpointCount];

                for (int i = 0; i < pmsFile.spawnpointCount; i++)
                {
                    pmsFile.spawnpoints[i] = new PMS_SPAWNPOINT(br);
                }

                // waypoints
                pmsFile.waypointCount = br.ReadInt32();
                pmsFile.waypoints = new PMS_WAYPOINT[pmsFile.waypointCount];

                for (int i = 0; i < pmsFile.waypointCount; i++)
                {
                    pmsFile.waypoints[i] = new PMS_WAYPOINT(br);
                }
            }

            Console.WriteLine("File read succesfuly");

            return pmsFile;
        }
    }
}
