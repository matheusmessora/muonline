using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            setMinimized();
            Process.Start("main.exe");
        }

        private void radioButton1_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(2);
        }

        private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            
            Application.Exit();
        }

        private void radioButton3_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(4);
        }

        private void setMinimized()
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("WindowMode", 1, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("WindowMode", 1, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void addResolution(int id)
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void radioButton2_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(3);
        }
    }
}
