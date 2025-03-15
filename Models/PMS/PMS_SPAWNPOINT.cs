/*
	typedef struct tagPMS_SPAWNPOINT {
		BOOL active;
		UBYTE filler[3];
		LONG x;
		LONG y;
		PMS_SPAWNTEAM team;
	} PMS_SPAWNPOINT;
*/
namespace M79Climbing.Models.PMS
{
    public class PMS_SPAWNPOINT
    {
		public bool active;
        public byte[] filler;
        public uint x;
        public uint y;

        public enum PMS_SPAWNTEAM
        {
            stGENERAL = 0,
            stALPHA,
            stBRAVO,
            stCHARLIE,
            stDELTA,
            stALPHA_FLAG,
            stBRAVO_FLAG,
            stGRENADES,
            stMEDKITS,
            stCLUSTERS,
            stVEST,
            stFLAMER,
            stBERSERKER,
            stPREDATOR,
            stYELLOW_FLAG,
            stRAMBO_BOW,
            stSTAT_GUN
        }

        public PMS_SPAWNTEAM team;

        public PMS_SPAWNPOINT(BinaryReader br)
        {
            active = Convert.ToBoolean(br.ReadBoolean());
            filler = br.ReadBytes(3);
            x = br.ReadUInt32();
            y = br.ReadUInt32();
            team = (PMS_SPAWNTEAM)br.ReadUInt32();
        }
    }
}
