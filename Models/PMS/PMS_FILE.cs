namespace M79Climbing.Models.PMS
{
    /*
        typedef          char    CHAR ;

        typedef signed   __int8  BYTE ;
        typedef          BYTE    byte ;

        typedef unsigned __int8  UBYTE ;
        typedef          UBYTE   ubyte ;

        typedef unsigned __int16 WORD ;
        typedef          WORD    word ;

        typedef unsigned __int16 USHORT ;
        typedef          USHORT  ushort ;
        typedef          short   SHORT ;

        typedef unsigned __int32 DWORD ;
        typedef          DWORD   dword ;
        typedef          long    LONG ;

        typedef unsigned __int32 ULONG ;
        typedef          ULONG   ulong ;

        typedef signed   __int64 QUAD ;
        typedef          QUAD    quad ;

        typedef unsigned __int64 UQUAD ;
        typedef          UQUAD   uquad ;
        typedef          float   FLOAT ;
        typedef          double  DOUBLE ;
     */

    /*
        struct PMS_FILE {
            PMS_HEADER header;
            PMS_OPTIONS options;
            LONG polygonCount;
            PMS_POLYGON polygon[polygonCount];
            LONG sectorDivision;
            LONG numSectors;
            //PMS_SECTOR sector[(numSectors*2)+1][(numSectors*2)+1]; // unlike VB/Delphi, can't define the lower bound; only the length. -25 to 25 is the same as 0 to 50, or length of 51 ((2*25)+1)
            PMS_SECTOR sector[((numSectors*2)+1)*((numSectors*2)+1)]; // same as above, but as a single flat array. Use whatever you feel most comfortable with.
            LONG propCount;
            PMS_PROP prop[propCount];
            LONG sceneryCount;
            PMS_SCENERY scenery[sceneryCount];
            LONG colliderCount;
            PMS_COLLIDER collider[colliderCount];
            LONG spawnpointCount;
            PMS_SPAWNPOINT spawnpoint[spawnpointCount];
            LONG waypointCount;
            PMS_WAYPOINT waypoint[waypointCount];
        };
    */

    public class PMS_FILE
    {
        public PMS_HEADER header;
        public PMS_OPTIONS options;
        public uint polygonCount;
        public PMS_POLYGON[] polygons;
        public uint sectorDivision;
        public uint numSectors;
        public PMS_SECTOR[,] sectors;
        public int propCount;
        public PMS_PROP[] props;
        public int sceneryCount;
        public PMS_SCENERY[] scenery;
        public int colliderCount;
        public PMS_COLLIDER[] colliders;
        public int spawnpointCount;
        public PMS_SPAWNPOINT[] spawnpoints;
        public int waypointCount;
        public PMS_WAYPOINT[] waypoints;
    }
}
