/*
	typedef struct tagPMS_WAYPOINT {
		BOOL active;
		UBYTE filler1[3];
		LONG id;
		LONG x;
		LONG y;
		BOOL left;
		BOOL right;
		BOOL up;
		BOOL down;
		BOOL jet;
		UBYTE path;
		PMS_SPECIALACTIONS specialAction;
		UBYTE c2;
		UBYTE c3;
		UBYTE filler2[3];
		LONG numConnections;
		LONG connections[20];
	} PMS_WAYPOINT;

	typedef enum SPECIALACTIONS {
		saNONE = 0,
		saSTOP_AND_CAMP,
		saWAIT_1_SECOND,
		saWAIT_5_SECONDS,
		saWAIT_10_SECONDS,
		saWAIT_15_SECONDS,
		saWAIT_20_SECONDS
	} PMS_SPECIALACTIONS;

*/
namespace M79Climbing.Models.PMS
{
    public class PMS_WAYPOINT
    {
		public bool active;
		public byte[] filler1;
        public uint id;
        public uint x;
        public uint y;
        public bool left;
        public bool right;
        public bool up;
        public bool down;
        public bool jet;
        public byte path;

        public enum PMS_SPECIALACTIONS
        {
            saNONE = 0,
            saSTOP_AND_CAMP,
            saWAIT_1_SECOND,
            saWAIT_5_SECONDS,
            saWAIT_10_SECONDS,
            saWAIT_15_SECONDS,
            saWAIT_20_SECONDS
        }

        public PMS_SPECIALACTIONS specialAction;

        public byte c2;
        public byte c3;
        public byte[] filler2;
        public uint numConnections;
        public uint[] connections;

        public PMS_WAYPOINT(BinaryReader br)
		{
			active = Convert.ToBoolean(br.ReadBoolean());
            filler1 = br.ReadBytes(3);
            id = br.ReadUInt32();
            x = br.ReadUInt32();
            y = br.ReadUInt32();
            left = Convert.ToBoolean(br.ReadBoolean());
            right = Convert.ToBoolean(br.ReadBoolean());
            up = Convert.ToBoolean(br.ReadBoolean());
            down = Convert.ToBoolean(br.ReadBoolean());
            jet = Convert.ToBoolean(br.ReadBoolean());
            path = br.ReadByte();
            specialAction = (PMS_SPECIALACTIONS)br.ReadByte();
            c2 = br.ReadByte();
            c3 = br.ReadByte();
            filler2 = br.ReadBytes(3);
            numConnections = br.ReadUInt32();
            connections = new uint[20];

            for (int i = 0; i < 20; i++)
            {
                this.connections[i] = br.ReadUInt32();
            }
        }
    }
}
