/*
    typedef struct tagPMS_SECTOR {
    	WORD polyCount;
    	WORD polys[polyCount];
    } PMS_SECTOR;
*/

namespace M79Climbing.Models.PMS
{
    public class PMS_SECTOR
    {
        public ushort polyCount;
        public ushort[] polys;

        public PMS_SECTOR(BinaryReader br)
        {
            polyCount = br.ReadUInt16();

            polys = new ushort[polyCount];

            for (int i = 0; i < polyCount; i++)
            {
                polys[i] = br.ReadUInt16();
            }
        }
    }
}