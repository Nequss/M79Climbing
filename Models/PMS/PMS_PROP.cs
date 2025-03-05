/*
	typedef struct tagPMS_PROP {
		BOOL active;
		UBYTE filler1;
		WORD style;
		LONG width;
		LONG height;
		FLOAT x;
		FLOAT y;
		FLOAT rotation;
		FLOAT scaleX;
		FLOAT scaleY;
		UBYTE alpha;
		UBYTE filler2[3];
		PMS_COLOR color;
		PMS_DRAWBEHIND level;
		UBYTE filler3[3];
	} PMS_PROP;

    typedef enum DRAWBEHIND {
    	dbBEHIND_ALL = 0,
    	dbBEHIND_MAP,
    	dbBEHIND_NONE
    } PMS_DRAWBEHIND;
*/

namespace M79Climbing.Models.PMS
{
    public class PMS_PROP
    {
        public bool active;
        public byte filler1;
        public ushort style;
        public uint width;
        public uint height;
        public float x;
		public float y;
        public float rotation;
        public float scaleX;
        public float scaleY;
        public byte alpha;
        public byte[] filler2;
        public PMS_COLOR color;

        public enum PMS_DRAWBEHIND
        {
            dbBEHIND_ALL = 0,
            dbBEHIND_MAP,
            dbBEHIND_NONE
        }

        public PMS_DRAWBEHIND level;
        public byte[] filler3;

        public PMS_PROP(BinaryReader br) 
        {
            active = Convert.ToBoolean(br.ReadBoolean());
            filler1 = br.ReadByte();
            style = br.ReadUInt16();
            width = br.ReadUInt32();
            height = br.ReadUInt32();
            x = br.ReadSingle();
            y = br.ReadSingle();
            rotation = br.ReadSingle();
            scaleX = br.ReadSingle();
            scaleY = br.ReadSingle();
            alpha = br.ReadByte();
            filler2 = br.ReadBytes(3);
            color = new PMS_COLOR(br);
            level = (PMS_DRAWBEHIND)br.ReadByte();
            filler3 = br.ReadBytes(3);
        }
    }
}
