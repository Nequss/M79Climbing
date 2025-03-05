using Microsoft.Extensions.Options;

namespace M79Climbing.Models.PMS
{
    /*
		typedef struct tagPMS_OPTIONS {
		    UBYTE nameLen;
		    CHAR name[nameLen];
		    CHAR nameFiller[38-nameLen];
		    UBYTE texLen;
		    CHAR texture[texLen];
		    CHAR textureFiller[24 - texLen];
		    PMS_COLOR bgColorTop;
		    PMS_COLOR bgColorBottom;
		    LONG jetAmount;
		    UBYTE grenades;
		    UBYTE medikits;
		    PMS_WEATHERTYPE weather;
		    PMS_STEPSTYPE steps;
		    LONG randID;
		} PMS_OPTIONS;
	*/

    public class PMS_OPTIONS
    {
		// Name
        public byte nameLen;
		public char[] name;
		public char[] nameFiller; // 38 - nameLen

        // Texture
        public byte texLen;
        public char[] texture;
        public char[] textureFiller; // 24 - texLen

        // Background Color
        public PMS_COLOR bgColorTop;
        public PMS_COLOR bgColorBottom;

        // Other Options
        public uint jetAmount;
        public byte grenades;
        public byte medikits;

        // Weather Type
        public enum PMS_WEATHERTYPE : byte
        {
            wtNONE = 0,
            wtRAIN = 1,
            wtSANDSTORM = 2,
            wtSNOW = 3
        }

        public PMS_WEATHERTYPE weather;

        // Steps Type
        public enum PMS_STEPSTYPE : byte
        {
            stHARD_GROUND = 0,
            stSOFT_GROUND = 1,
            stNONE = 2
        }

        public PMS_STEPSTYPE stepType;

        // Random ID
        public long randID;

        public PMS_OPTIONS(BinaryReader br)
        {
            nameLen = br.ReadByte();
            name = br.ReadChars(this.nameLen);
            nameFiller = br.ReadChars(38 - this.nameLen);

            texLen = br.ReadByte();
            texture = br.ReadChars(this.texLen);
            textureFiller = br.ReadChars(24 - this.texLen);

            bgColorTop = new PMS_COLOR(br);
            bgColorBottom = new PMS_COLOR(br);

            jetAmount = br.ReadUInt32();
            grenades = br.ReadByte();
            medikits = br.ReadByte();

            weather = (PMS_WEATHERTYPE)br.ReadByte();
            stepType = (PMS_STEPSTYPE)br.ReadByte();

            randID = br.ReadInt32();
        }
    }
}
